import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
});

// Standard Error Handling Middleware
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;

export interface AdvisoryMetrics {
    base_cost: number;
    logistics: number;
    rodtep_benefit: number;
    dbk_benefit: number;
    gst_benefit: number;
    net_cost: number;
    total_incentives: number;
    compliance_status: string;
}

export interface AdvisoryResponse {
    status: string;
    hs_code: string;
    product_name: string;
    verdict: "GO" | "CAUTION";
    confidence: number;
    metrics: AdvisoryMetrics;
    gi_status?: string;
    brand_lineage?: string;
}
