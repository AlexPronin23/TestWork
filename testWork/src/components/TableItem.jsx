const TableItem = ({
  id,
  firstName,
  lastName,
  maidenName,
  age,
  gender,
  email,
  phone,
  address,
  fetchOneUser,
}) => {
  return (
    <>
      <tr key={id} onClick={() => fetchOneUser(id)}>
        <td>{firstName}</td>
        <td>{lastName}</td>
        <td>{maidenName || "-"}</td>
        <td>{age}</td>
        <td>{gender}</td>
        <td>{phone}</td>
        <td>{email}</td>
        <td>{address?.country || "-"}</td>
        <td>{address?.city || "-"}</td>
      </tr>
    </>
  );
};

export default TableItem;
