import { useEffect, useState } from "react";
import TableItem from "./TableItem";

const Table = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Текущаю страница
  const [totalPage, setTotalPage] = useState(0); // Общее количество страниц
  const limit = 5;

  async function fetchUsers(page = 1, sortBy = null, order = null) {
    setLoading(true);
    setError("");
    try {
      const skip = (page - 1) * limit;
      let url = `https://dummyjson.com/users?&limit=${limit}&skip=${skip}&select=firstName,lastName,maidenName,age,gender,email,phone,address`;

      if (sortBy && order) {
        url += `&sortBy=${sortBy}&order=${order}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        let message = `Error happened :  ${response.status} - ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();

      setUsers(data.users);
      setTotalPage(Math.ceil(data.total / limit));
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPage) {
      fetchUsers(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      fetchUsers(currentPage - 1);
    }
  };

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
            {users.length > 0
              ? users.map((user) => <TableItem {...user} />)
              : ""}
          </tbody>
        </table>
      )}

      <div className="table__control">
        <p>Сортировать по :</p>
        <select className="table__select">
          <optgroup label="Возрастанию">
            <option value="firstName-asc">Имя</option>
            <option value="lastName-asc">Фамилия</option>
            <option value="maidenName-asc">Отчество</option>
            <option value="age-asc">Возраст</option>
            <option value="gender-asc">Пол</option>
            <option value="phone-asc">Номер телефона</option>
          </optgroup>
          <optgroup label="Убыванию">
            <option value="firstName-desc">Имя</option>
            <option value="lastName-desc">Фамилия</option>
            <option value="maidenName-desc">Отчество</option>
            <option value="age-desc">Возраст</option>
            <option value="gender-desc">Пол</option>
            <option value="phone-desc">Номер телефона</option>
          </optgroup>
          <option value="withoutSort">Без сортировки</option>
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
    </div>
  );
};

export default Table;
