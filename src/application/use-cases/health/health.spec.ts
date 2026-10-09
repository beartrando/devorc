import * as healthProto from '../../../contracts/proto/common/health';
import HealthUseCase from './health';

describe('HealthUseCase', () => {
    let healthUseCase: HealthUseCase;

    beforeEach(() => {
        healthUseCase = new HealthUseCase();
    });

    it('should return HEALTH_STATUS_OK with service name', async () => {
        const result = await healthUseCase.execute();

        expect(result.service).toBe('service-template');
        expect(result.status).toBe(healthProto.HealthStatus.HEALTH_STATUS_OK);
        expect(result.components).toEqual({});
        expect(result.timestamp).toBeInstanceOf(Date);
    });
});
