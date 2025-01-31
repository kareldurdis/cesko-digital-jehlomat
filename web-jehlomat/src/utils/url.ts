export function convertSearchParamsToString(params: Record<string, string>): string | undefined {
  const searchStringParams = new URLSearchParams(params).toString();
    return searchStringParams === "" ? undefined : `?${searchStringParams}`;
}

export function convertSearchStringToMap(params: string): URLSearchParams {
  return new URLSearchParams(params);
}