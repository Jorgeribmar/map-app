interface PerformanceMetric {
    name: string;
    startTime: number;
    duration: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetric[] = [];
    private marks: Map<string, number> = new Map();

    private constructor() { }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    public startMark(name: string): void {
        this.marks.set(name, window.performance.now());
    }

    public endMark(name: string, metadata?: Record<string, any>): void {
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`No start mark found for: ${name}`);
            return;
        }

        const endTime = window.performance.now();
        const duration = endTime - startTime;

        this.metrics.push({
            name,
            startTime,
            duration,
            metadata
        });

        this.marks.delete(name);
    }

    public getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    public getAverageMetric(name: string): number | null {
        const relevantMetrics = this.metrics.filter(metric => metric.name === name);
        if (relevantMetrics.length === 0) return null;

        const sum = relevantMetrics.reduce((acc, metric) => acc + metric.duration, 0);
        return sum / relevantMetrics.length;
    }

    public clearMetrics(): void {
        this.metrics = [];
        this.marks.clear();
    }

    public logMetrics(): void {
        console.group('Performance Metrics');
        this.metrics.forEach(metric => {
            console.log(`${metric.name}:`, {
                duration: `${metric.duration.toFixed(2)}ms`,
                metadata: metric.metadata
            });
        });
        console.groupEnd();
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();