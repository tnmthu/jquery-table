(function($) {
  $.fn.table = function(data) {
  //  var privatevar1 = '';
  //  var privatevar2 = '';
  //  // private methods
  //  var myPrivateMethod = function() {
  //   // do something ...
  //  }
    const headers = [
      "Id",
      "Employee",
      "Age",
      "Salary"
    ];

    const tableData = data;
    $(this).empty();
    $(this).append(`
      <table>
        <thead>
          <th><input type="checkbox" id="select_all" value="select_all"></th>
          ${headers.map(function(item) {
            return `<th>${item}</th>`
          }).join("")}
        </thead>
        <tbody>
          ${tableData.map(function(item) {
            return `
            <tr id="${item["id"]}">
              <td>
                <input type="checkbox" id="select_${item["id"]}">
              </td>
              <td class="id">${item["id"]}</td>
              <td class="name">${item["employee_name"]}</td>
              <td class="age">${item["employee_age"]}</td>
              <td class="salary">${item["employee_salary"]}</td>
            </tr>
            `
          }).join("")}
        </tbody>
      </table>
    `)
  }
}(jQuery));