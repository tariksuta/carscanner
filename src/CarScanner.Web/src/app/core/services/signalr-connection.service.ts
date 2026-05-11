import { inject, Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/services/token.service';
import { TenantContextService } from './tenant-context.service';
import { NotificationPayload } from '../../features/notifications/models/notification.model';

/**
 * Manages a singleton SignalR connection to the /hubs/notifications endpoint.
 * Auto-reconnect uses default exponential backoff (0, 2, 10, 30 sec, then stop).
 * JWT token is supplied via accessTokenFactory — SignalR appends it as
 * ?access_token=... query string (WebSocket spec doesn't allow custom headers).
 * PlatformAdmin's impersonated tenant goes via ?tenantId=... for the same reason —
 * the hub honors it only for users in the PlatformAdmin role.
 */
@Injectable({ providedIn: 'root' })
export class SignalRConnectionService implements OnDestroy {
  private readonly tokenService = inject(TokenService);
  private readonly tenantContext = inject(TenantContextService);
  private connection: HubConnection | null = null;

  /** Emits server-pushed notification payloads from the hub. */
  readonly notification$ = new Subject<NotificationPayload>();

  /** Emits the current connection state (connected/disconnected). */
  readonly connectionState$ = new Subject<HubConnectionState>();

  async start(): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    // Strip "/api" off baseUrl — hub lives at the root.
    const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
    const tenantId = this.tenantContext.currentTenantId();
    const hubUrl = tenantId
      ? `${apiBase}/hubs/notifications?tenantId=${encodeURIComponent(tenantId)}`
      : `${apiBase}/hubs/notifications`;

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.tokenService.getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('notification', (payload: NotificationPayload) => {
      this.notification$.next(payload);
    });

    this.connection.onreconnecting(() => this.connectionState$.next(HubConnectionState.Reconnecting));
    this.connection.onreconnected(() => this.connectionState$.next(HubConnectionState.Connected));
    this.connection.onclose(() => this.connectionState$.next(HubConnectionState.Disconnected));

    try {
      await this.connection.start();
      this.connectionState$.next(HubConnectionState.Connected);
    } catch (err) {
      console.error('[SignalR] Failed to start connection:', err);
      this.connectionState$.next(HubConnectionState.Disconnected);
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
