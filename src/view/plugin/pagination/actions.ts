export const SetPaginationInfo = (page: number, limit: number) => (state) => {
  return {
    ...state,
    pagination: {
      page,
      limit,
    },
  };
};
