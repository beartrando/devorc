import HealthUseCase from "../application/use-cases/health/health";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";
import HealthHandler from "../infrastructure/grpc/handlers/health.handler";
import GrpcService from "../infrastructure/grpc/service";
import grpcConfig from "../infrastructure/grpc/config";
import jobConfig from "../infrastructure/job/config";
import authConfig from "../infrastructure/auth/config";
import Application from "../application/application";
import AuthService from "../infrastructure/auth/service";
import MessageService from "../infrastructure/message/service";
import JobService from "../infrastructure/job/service";
import DbService from "../infrastructure/db/service";
import PrismaBaseServiceRepository from "../infrastructure/db/repositories/prisma-base-service.repository";
import GetOrCreateUseCase from "../application/use-cases/base-service/get-or-create";
import GetByUserUseCase from "../application/use-cases/base-service/get-by-user";
import BaseServiceHandler from "../infrastructure/grpc/handlers/base-service.handler";
import GetUseCase from "../application/use-cases/base-service/get";
import UserCreatedConsumer from "../infrastructure/message/consumers/user-created";
import messageConfig from "../infrastructure/message/configs/message.config";
import messageProducersConfig from "../infrastructure/message/configs/producers.config";
import messageConsumersConfig from "../infrastructure/message/configs/consumers.config";

function buildApplication() {
    const authService = new AuthService(authConfig);

    const jobService = new JobService(jobConfig, messageConfig, messageProducersConfig)
    const dbService = new DbService();

    const base-serviceRepository = new PrismaBaseServiceRepository(dbService.client);

    const getOrCreateUseCase = new GetOrCreateUseCase(base-serviceRepository, jobService, messageProducersConfig.base-serviceCreated);


    const userCreatedConsumer = new UserCreatedConsumer(getOrCreateUseCase);

    const messageService = new MessageService(messageConfig);

    messageService.addConsumer(
        messageConsumersConfig.userCreated,
        userCreatedConsumer.execute.bind(userCreatedConsumer)
    )

    const getUseCase = new GetUseCase(base-serviceRepository);
    const getByUserUseCase = new GetByUserUseCase(base-serviceRepository);

    const healthUseCase = new HealthUseCase(dbService, messageService, jobService);
    const statusUseCase = new StatusUseCase;
    const livezUseCase = new LivezUseCase;
    const readyzUseCase = new ReadyzUseCase;

    const base-serviceHandler = new BaseServiceHandler(authService, getOrCreateUseCase, getByUserUseCase, getUseCase);
    const healthHandler = new HealthHandler(healthUseCase, statusUseCase, livezUseCase, readyzUseCase);

    const grpcService = new GrpcService(grpcConfig.port, base-serviceHandler, healthHandler);

    return new Application(grpcService, dbService, jobService, messageService);
}


export default buildApplication;
