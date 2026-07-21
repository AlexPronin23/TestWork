import { useEffect, useState } from "react";
import TableItem from "./TableItem";

const Table = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Текущаю страница
  const [totalPage, setTotalPage] = useState(0); // Общее количество страниц
  const limit = 10; // Количество пользователей на странице

  // Функция для взаимодействия с данными пользователей
  async function fetchUsers(
    page = 1,
    sortBy = null,
    order = null,
    key = null,
    value = null,
  ) {
    setLoading(true);
    setError("");
    try {
      const skip = (page - 1) * limit;
      let url = `https://dummyjson.com/users?&limit=${limit}&skip=${skip}&select=firstName,lastName,maidenName,age,gender,email,phone,address,image`;

      // Для работы с сортировкой
      if (sortBy && order) {
        url += `&sortBy=${sortBy}&order=${order}`;
      }

      // Для работы с фильтрацией
      if (key && order) {
        url += `/filter&key=${key}&value=${value}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        let message = `Error happened :  ${response.status} - ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();

      setCurrentPage(page);
      setTotalPage(Math.ceil(data.total / limit));
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  }

  //Функция для перехода на следующию страницу
  const goToNextPage = () => {
    if (currentPage < totalPage) {
      fetchUsers(currentPage + 1);
    }
  };
  // Функция для перехода на предыдущию страницу
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      fetchUsers(currentPage - 1);
    }
  };

  // Функция для сортировки
  const handleSort = (e) => {
    const value = e.target.value;

    if (value === "none") {
      fetchUsers(currentPage);
      return;
    }

    const [sortBy, order] = value.split("-");

    if (sortBy && order) {
    }

    fetchUsers(currentPage, sortBy, order);
  };

  // // Функция для фильтрации
  // const handleFilter = (e) => {};

  useEffect(() => {
    fetchUsers(1);
  }, []);

  return (
    <div className="table__wrapper">
      {loading ? (
        <>
          <h1 className="table__loading">Загрузка...</h1>
        </>
      ) : (
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
              users.map((user) => <TableItem {...user} />)
            ) : (
              <>
                <span>Пользователей нет</span>
              </>
            )}
          </tbody>
        </table>
      )}

      {/* Сортировка */}
      <div className="table__control">
        <p>Сортировать по :</p>
        <select className="table__select" onChange={handleSort}>
          <optgroup label="Возрастанию">
            <option value="firstName-asc">Имя(A-Z)</option>
            <option value="lastName-asc">Фамилия(A-Z)</option>
            <option value="maidenName-asc">Отчество(A-Z)</option>
            <option value="age-asc">Возраст</option>
            <option value="gender-asc">Пол</option>
            <option value="phone-asc">Номер телефона</option>
          </optgroup>
          <optgroup label="Убыванию">
            <option value="firstName-desc">Имя(Z-A)</option>
            <option value="lastName-desc">Фамилия(Z-A)</option>
            <option value="maidenName-desc">Отчество(Z-A)</option>
            <option value="age-desc">Возраст</option>
            <option value="gender-desc">Пол</option>
            <option value="phone-desc">Номер телефона</option>
          </optgroup>
          <option value="withoutSort">Без сортировки</option>
        </select>
      </div>

      {/* Фильтрация */}
      <div className="table__filter">
        <p>Фильтровать по: </p>
        <select className="table__select">
          <option value="age-more">Возраст(больше 20)</option>
          <option value="age-less">Возраст(меньше 40)</option>
          <option value="gender-male">Пол(мужской)</option>
          <option value="gender-female">Пол(женский)</option>
        </select>
      </div>

      {/* Постраничное отображение */}
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
    </div>
  );
};

export default Table;
