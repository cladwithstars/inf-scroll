import React, { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
import axios from "axios";

export default function Search() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setError(false);
    setLoading(true);

    try {
      const { data } = await axios({
        method: "GET",
        url: "http://openlibrary.org/search.json",
        params: { q: query, page },
      });

      setBooks((prev) => [
        ...new Set([...prev, ...data.docs.map((book) => book.title)]),
      ]);
      setHasMore(data.docs.length > 0);
      setLoading(false);
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    setBooks([]);
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [query, page]); // eslint-disable-line
  const handleChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleChangeDebounced = debounce(handleChange, 200);

  const observer = useRef();
  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  return (
    <div>
      <input type="text" onChange={handleChangeDebounced} />
      <ul>
        {books.length &&
          books.map((book, idx) => {
            return idx === books.length - 1 ? (
              <li ref={lastBookElementRef} key={book}>
                {book}
              </li>
            ) : (
              <li key={book}>{book}</li>
            );
          })}
      </ul>
      <div>{loading && "Loading..."}</div>
      <div>{error && "Error..."}</div>
    </div>
  );
}
