import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): Promise<{
        status: "error" | "ok";
        timestamp: string;
    }>;
    detailed(): Promise<import("./health.service").HealthStatus>;
    readiness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    liveness(): {
        status: string;
        timestamp: string;
    };
}
