// src/telemetry/telemetry.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción pon aquí la URL de tu Angular
  },
})
export class TelemetryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Se ejecuta cuando el Front se conecta
  handleConnection(client: Socket) {
    console.log(`📡 Cliente conectado al WebSocket: ${client.id}`);
  }

  // Se ejecuta cuando el Front se desconecta
  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);
  }

  /**
   * Este método lo llama el TelemetryService
   * Envía los datos solo a los interesados en esa unidad
   */
  sendUpdate(unitId: string, data: any) {
    // Emitimos a un "room" específico o a un canal dinámico
    // El Front escuchará el evento: `telemetry_UNIT-01`
    this.server.emit(`telemetry_${unitId}`, data);
  }
}
