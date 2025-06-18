export default {
    areEqual(a: string, b: string | undefined) {
        return a.localeCompare(b ?? '', undefined, { sensitivity: 'accent' }) === 0;
    },
  };
