export default {
    areEqual(a: string, b: string | undefined) {
        return a.localeCompare(b ?? '', undefined, { sensitivity: 'accent' }) === 0;
    },
    isStatusOk(status: number) {
        return status >= 200 && status <= 206; 
    },
  };
