export interface FTAData {
    country: string;
    lat: number;
    lng: number;
    agreementName: string;
    dutyRate: number;
    standardRate: number;
    status: string;
    sectors: string[];
    specialFlags?: string[];
    specialChecklist?: string[];
    projectionYear?: number;
}

export const ftaMarkets: FTAData[] = [
    {
        country: "New Zealand",
        lat: -40.9006,
        lng: 174.886,
        agreementName: "India-NZ FTA (2025)",
        dutyRate: 0,
        standardRate: 10,
        status: "100% DUTY-FREE ACCESS",
        sectors: ["Textiles", "Leather", "Gems", "Engineering"],
        specialFlags: ["AYUSH Recognition", "Quarantine Protocol V2"],
        specialChecklist: [
            "Phytosanitary Certificate Verification",
            "Bio-Security Audit Level 4",
            "AYUSH Wellness Certification",
            "Eco-Packaging Compliance"
        ],
        projectionYear: 2025
    },
    {
        country: "Australia",
        lat: -25.2744,
        lng: 133.7751,
        agreementName: "ECTA (Economic Cooperation)",
        dutyRate: 0,
        standardRate: 12.5,
        status: "ZERO-TARIFF LABOR SECTORS",
        sectors: ["Textiles", "Leather", "Footwear", "Furniture"],
    },
    {
        country: "UAE",
        lat: 23.4241,
        lng: 53.8478,
        agreementName: "CEPA (Comprehensive Partnership)",
        dutyRate: 0,
        standardRate: 8,
        status: "ACTIVE 0% THRESHOLD",
        sectors: ["Gems & Jewelry", "Food Security", "Machinery"],
        specialFlags: ["Direct-to-UAE Logistics Incentive"]
    },
    {
        country: "Oman",
        lat: 21.5126,
        lng: 55.9233,
        agreementName: "India-Oman CEPA",
        dutyRate: 0,
        standardRate: 7.5,
        status: "DUTY-FREE STRATEGIC HUB",
        sectors: ["Petrochemicals", "Agriculture", "Steel"],
    },
    {
        country: "United Kingdom",
        lat: 55.3781,
        lng: -3.436,
        agreementName: "UK-India CETA (2026)",
        dutyRate: 0.5,
        standardRate: 15,
        status: "99% TARIFF-FREE PROJECTION",
        sectors: ["Services", "Pharma", "Automotive"],
        projectionYear: 2026
    }
];
