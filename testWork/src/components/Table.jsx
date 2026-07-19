import { useEffect, useState } from "react";
import TableItem from "./TableItem";

const Table = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchUsers() {
    try {
      const response = await fetch(
        "https://dummyjson.com/users?limit=5&select=firstName,lastName,maidenName,age,gender,email,phone,address",
      );

      if (!response.ok) {
        let message = `Error happened :  ${response.status} - ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();

      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  }

  useEffect(() => {
    fetchUsers();
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
    </div>
  );
};

export default Table;
