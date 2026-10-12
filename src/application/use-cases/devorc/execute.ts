import appConfig from "../../../infrastructure/app/config";

const startedAt = Date.now();

export class ExecuteUseCase {
    async execute(): Promise<Object> {
        return {
            status: 'executed',
        };

    }
}


export default ExecuteUseCase;
