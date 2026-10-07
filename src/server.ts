import express, { Application, ErrorRequestHandler } from 'express';
import routes from './routes';
import pool from './conf/dbConnection';

export class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT ?? 3000);

    this.middlewares();
    this.routes();
    this.errorHandlers();
  }

  private middlewares(): void {
    // Debe ir antes de las rutas para que req.body ya venga parseado
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use('/api/v1', routes);
  }

  private errorHandlers(): void {
    // Cualquier ruta que no exista
    this.app.use((_req, res) => {
      res.status(404).json({ message: 'Ruta no encontrada' });
    });

    // JSON mal formado en el body u otros errores no controlados
    const handler: ErrorRequestHandler = (err, _req, res, _next) => {
      if (err.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
        return;
      }
      console.error(err);
      res.status(500).json({ message: 'Error interno del servidor' });
    };
    this.app.use(handler);
  }

  async listen(): Promise<void> {
    try {
      await pool.query('SELECT 1');
      console.log('Conectado a la base de datos');
    } catch (error) {
      console.error('No se pudo conectar a la base de datos:', (error as Error).message);
      process.exit(1);
    }

    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en http://localhost:${this.port}`);
    });
  }
}
