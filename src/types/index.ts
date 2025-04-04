export type Report = {
    id: string;
    description: string;
    address: string;
    image_url: string;
    geom: string;
    created_at: string;
    updated_at: string;
}

export type NewReportBody = {
    image: File;
    description: string;
    longitude: string;
    latitude: string;
    address: string;
}
