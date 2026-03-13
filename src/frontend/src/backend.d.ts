import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ReagentRow {
    cpt: number;
    name: string;
    volume: number;
    price: number;
    mlCost: number;
}
export interface Session {
    reagents: Array<ReagentRow>;
    name: string;
    divisor: number;
}
export interface backendInterface {
    deleteSession(id: string): Promise<void>;
    getSession(id: string): Promise<Session>;
    listSessions(): Promise<Array<[string, Session]>>;
    saveSession(id: string, name: string, divisor: number, reagents: Array<[string, number, number]>): Promise<void>;
}
