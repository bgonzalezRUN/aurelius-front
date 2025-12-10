import { useSearchParams } from 'react-router-dom';

export const useUrlPagination = (paramName: string = 'page') => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get(paramName);

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  const setPage = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (newPage === 1) {
      newSearchParams.delete(paramName);
    } else {
      newSearchParams.set(paramName, String(newPage));
    }

    setSearchParams(newSearchParams);
  };

  return [page, setPage] as const;
};
