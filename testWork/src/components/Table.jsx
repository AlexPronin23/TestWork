import { useEffect, useState, useRef } from "react";
import TableItem from "./TableItem";

const Table = () => {
  const [users, setUsers] = useState([]);
  const [singleUser, setSingleUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeSort, setActiveSort] = useState("none");
  const [open, setOpen] = useState(false);
  const limit = 10;

  // Ширина колонок
  const [colWidths, setColWidths] = useState({
    firstName: 150,
    lastName: 150,
    maidenName: 150,
    age: 100,
    gender: 100,
    phone: 200,
    email: 250,
    country: 150,
    city: 150,
  });

  const [resizing, setResizing] = useState(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const startResize = (e, key) => {
    e.preventDefault();
    setResizing(key);
    startX.current = e.clientX;
    startWidth.current = colWidths[key];
  };

  const onMouseMove = (e) => {
    if (resizing === null) return; // если ничего не тянем - выходим
    const diff = e.clientX - startX.current;
    const newWidth = Math.max(50, startWidth.current + diff);
    setColWidths((prev) => ({
      ...prev,
      [resizing]: newWidth,
    }));
  };

  const stopResize = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", stopResize);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", stopResize);
      document.body.style.cursor = "default";
    };
  }, [resizing]);

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

  // Функция для получения одного пользователя
  async function fetchOneUser(id) {
    try {
      const response = await fetch(
        `https://dummyjson.com/users/${id}?select=firstName,lastName,maidenName,age,address,height,weight,phone,email,image`,
      );

      if (!response.ok) {
        let message = `Error happened: ${response.status} `;
        throw new Error(message);
      }

      const data = await response.json();
      setSingleUser(data);
      setOpen(true);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
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

  const closeModal = () => {
    setOpen(false);
    setSingleUser(null);
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
                <th
                  style={{ width: colWidths.firstName }}
                  className="table__resizable"
                >
                  Имя
                  <div
                    className={`table__resize__handle ${resizing === "firstName" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "firstName")}
                  />
                </th>
                <th
                  style={{ width: colWidths.lastName }}
                  className="table__resizable"
                >
                  Фамилия
                  <div
                    className={`table__resize__handle ${resizing === "lastName" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "lastName")}
                  />
                </th>
                <th
                  style={{ width: colWidths.maidenName }}
                  className="table__resizable"
                >
                  Отчество
                  <div
                    className={`table__resize__handle ${resizing === "maidenName" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "maidenName")}
                  />
                </th>
                <th
                  style={{ width: colWidths.age }}
                  className="table__resizable"
                >
                  Возраст
                  <div
                    className={`table__resize__handle ${resizing === "age" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "age")}
                  />
                </th>
                <th
                  style={{ width: colWidths.gender }}
                  className="table__resizable"
                >
                  Пол
                  <div
                    className={`table__resize__handle ${resizing === "gender" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "gender")}
                  />
                </th>
                <th
                  style={{ width: colWidths.phone }}
                  className="table__resizable"
                >
                  Номер телефона
                  <div
                    className={`table__resize__handle ${resizing === "phone" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "phone")}
                  />
                </th>
                <th
                  style={{ width: colWidths.email }}
                  className="table__resizable"
                >
                  Email
                  <div
                    className={`table__resize__handle ${resizing === "email" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "email")}
                  />
                </th>
                <th
                  style={{ width: colWidths.country }}
                  className="table__resizable"
                >
                  Страна
                  <div
                    className={`table__resize__handle ${resizing === "country" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "country")}
                  />
                </th>
                <th
                  style={{ width: colWidths.city }}
                  className="table__resizable"
                >
                  Город
                  <div
                    className={`table__resize__handle ${resizing === "city" ? "active" : ""}`}
                    onMouseDown={(e) => startResize(e, "city")}
                  />
                </th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableItem
                    key={user.id}
                    {...user}
                    fetchOneUser={fetchOneUser}
                  />
                ))
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

          {/* Модальное окно */}
          <div className={`table__modal ${open ? "open" : ""}`}>
            <div
              className="table__modal__content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="table__modal__close" onClick={closeModal}>
                ✕
              </button>
              {singleUser && (
                <div className="table__modal__user">
                  <img src={singleUser.image} alt={singleUser.firstName} />
                  <h2>
                    <strong>Имя: </strong> {singleUser.firstName}
                  </h2>
                  <h2>
                    <strong>Фамилия: </strong> {singleUser.lastName}
                  </h2>
                  <p>
                    <strong>Отчество:</strong> {singleUser.maidenName || "-"}
                  </p>
                  <p>
                    <strong>Возраст:</strong> {singleUser.age}
                  </p>
                  <p>
                    <strong>Страна:</strong>{" "}
                    {singleUser.address?.country || "-"}
                  </p>
                  <p>
                    <strong>Город:</strong> {singleUser.address?.city || "-"}
                  </p>
                  <p>
                    <strong>Рост:</strong> {singleUser.height} см
                  </p>
                  <p>
                    <strong>Вес:</strong> {singleUser.weight} кг
                  </p>
                  <p>
                    <strong>Телефон:</strong> {singleUser.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {singleUser.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Table;
