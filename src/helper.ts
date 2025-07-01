export default {
    areEqual(a: string, b: string | undefined) {
        return a.localeCompare(b ?? '', undefined, { sensitivity: 'accent' }) === 0;
    },
    isStatusOk(status: number) {
        return status >= 200 && status <= 206; 
    },
    toMunutes(seconds: number) {
        if(seconds < 60)
            return `${seconds} сек.`;
        return (seconds / 60).toFixed(0) + ':' + (seconds % 60).toFixed(0).padStart(2, '0') + ' мин.'; 
    }
  };
