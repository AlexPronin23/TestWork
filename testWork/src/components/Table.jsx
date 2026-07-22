import { useEffect, useState } from "react";
import TableItem from "./TableItem";

const Table = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeSort, setActiveSort] = useState("none");
  const limit = 10;

  // Функция для обычного запроса
  async function fetchUsers(page = 1, sortBy = null, order = null) {
    setLoading(true);
    setError("");
    try {
      const skip = (page - 1) * limit;
      let url = `https://dummyjson.com/users?limit=${limit}&skip=${skip}&select=firstName,lastName,maidenName,age,gender,email,phone,address,image`;

      if (sortBy && order) {
        url += `&sortBy=${sortBy}&order=${order}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error happened: ${response.status}`);
      }

      const data = await response.json();

      setCurrentPage(page);
      setTotalPage(Math.ceil(data.total / limit));
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
    }
  }

  // Функция для фильтрации
  async function fetchFilterUsers(
    page = 1,
    filterKey = null,
    filterValue = null,
  ) {
    setLoading(true);
    setError("");
    try {
      const skip = (page - 1) * limit;
      const url = `https://dummyjson.com/users/filter?key=${filterKey}&value=${filterValue}&limit=${limit}&skip=${skip}&select=firstName,lastName,maidenName,age,gender,email,phone,address,image`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Error happened: ${response.status} - ${response.statusText}`,
        );
      }

      const data = await response.json();

      setCurrentPage(page);
      setTotalPage(Math.ceil(data.total / limit));
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPage) {
      if (activeFilter) {
        const [filterKey, filterValue] = activeFilter.split("=");
        fetchFilterUsers(currentPage + 1, filterKey, filterValue);
      } else if (activeSort) {
        const [sortBy, order] = activeSort.split("-");
        fetchUsers(currentPage + 1, sortBy, order);
      } else {
        fetchUsers(currentPage + 1);
      }
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      if (activeFilter) {
        const [filterKey, filterValue] = activeFilter.split("=");
        fetchFilterUsers(currentPage - 1, filterKey, filterValue);
      } else if (activeSort) {
        const [sortBy, order] = activeSort.split("-");
        fetchUsers(currentPage - 1, sortBy, order);
      } else {
        fetchUsers(currentPage - 1);
      }
    }
  };

  const handleSort = (e) => {
    const value = e.target.value;
    setActiveSort(value);

    if (value === "none") {
      setActiveSort(null);
      fetchUsers(currentPage);
      return;
    }

    const [sortBy, order] = value.split("-");

    if (activeFilter) {
      const [filterKey, filterValue] = activeFilter.split("=");
      fetchFilterUsers(currentPage, filterKey, filterValue);
    } else {
      fetchUsers(currentPage, sortBy, order);
    }
  };

  const handleFilter = (e) => {
    const value = e.target.value;

    if (value === "none") {
      setActiveFilter(null);
      fetchUsers(currentPage);
      return;
    }

    const [filterKey, filterValue] = value.split("=");
    setActiveFilter(value);
    fetchFilterUsers(currentPage, filterKey, filterValue);
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  return (
    <div className="table__wrapper">
      {loading ? (
        <h1 className="table__loading">Загрузка...</h1>
      ) : error ? (
        <h1 className="table__error">{error}</h1>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Отчество</th>
                <th>Возраст</th>
                <th>Пол</th>
                <th>Номер телефона</th>
                <th>Email</th>
                <th>Страна</th>
                <th>Город</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => <TableItem key={user.id} {...user} />)
              ) : (
                <tr>
                  <td colSpan="9">Пользователей нет</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table__control">
            <p>Сортировать по :</p>
            <select
              className="table__select"
              onChange={handleSort}
              value={activeSort}
            >
              <option value="none">Без сортировки</option>
              <optgroup label="Возрастанию">
                <option value="firstName-asc">Имя (A-Z)</option>
                <option value="lastName-asc">Фамилия (A-Z)</option>
                <option value="maidenName-asc">Отчество (A-Z)</option>
                <option value="age-asc">Возраст</option>
                <option value="gender-asc">Пол</option>
                <option value="phone-asc">Номер телефона</option>
              </optgroup>
              <optgroup label="Убыванию">
                <option value="firstName-desc">Имя (Z-A)</option>
                <option value="lastName-desc">Фамилия (Z-A)</option>
                <option value="maidenName-desc">Отчество (Z-A)</option>
                <option value="age-desc">Возраст</option>
                <option value="gender-desc">Пол</option>
                <option value="phone-desc">Номер телефона</option>
              </optgroup>
            </select>
          </div>

          <div className="table__filter">
            <p>Фильтровать по: </p>
            <select
              className="table__select"
              onChange={handleFilter}
              value={activeFilter}
            >
              <option value="none">Без фильтрации</option>
              <optgroup label="Возраст">
                <option value="age=25">25 лет</option>
                <option value="age=30">30 лет</option>
                <option value="age=35">35 лет</option>
                <option value="age=40">40 лет</option>
              </optgroup>
              <optgroup label="Пол">
                <option value="gender=male">Мужской</option>
                <option value="gender=female">Женский</option>
              </optgroup>
            </select>
          </div>

          <div className="table__pagination">
            <button
              className="table__previous"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Назад
            </button>

            <span className="table__total">
              {currentPage} из {totalPage}
            </span>

            <button
              className="table__next"
              onClick={goToNextPage}
              disabled={currentPage === totalPage}
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Table;
