export interface AnalyticsEvent {
  name: string;
  occurredAt: string;
  properties: Readonly<Record<string, string | number | boolean>>;
}
