(function($) {
  $.fn.table = function(metadata) {
    // let stripQuotes = function(s) {
    //   return s.replace(/['"]+\g/, '');
    // }

    const { columns, data, width } = metadata;
    const headers = [];
    const dataNames = [];
    const widths = [];
    const type = [];
    columns.forEach(item => {
      headers.push(item.colName);
      dataNames.push(item.dataName);
      widths.push(item.width);
      type.push(item.type);
    });

    const tableData = data;

    $(this).empty();
    $(this).append(`
      <table style="width: ${width}">
        <thead style="background-color: #0f007c; color: #fff;">
          <th style="border-color: #fff;"><input type="checkbox" id="select_all" value="select_all"></th>
          ${headers.map(function(item, index) {
            return `<th data-idx="${index}" style="width: ${widths[index]}; border-color: #fff;">${item}</th>`
          }).join("")}
        </thead>
        <tbody>
          ${tableData.map(function(item) {
            return `
            <tr id="${item["id"]}">
              <td>
                <input type="checkbox" id="select_${item["id"]}">
              </td>
              ${dataNames.map(function(elem) {
                return `
                  <td class="${elem}">${item[elem]}</td>
                `
              }).join("")}
            </tr>
            `
          }).join("")}
        </tbody>
      </table>
    `)
  
    $(this).find("thead").on("click", "th", function() {
      const idx = $(this).attr("data-idx");
      let rows = $(this).closest("table").find("tbody tr");
      let asc = $(this).attr("data-asc");
      if (typeof asc === typeof undefined || asc === false) {
        $(this).attr("data-asc", 1);
        rows.sort(function(a, b) {
          var A = $(a).find('td').eq(parseInt(idx) + 1).html();
          var B = $(b).find('td').eq(parseInt(idx) + 1).html();
          if (type[idx] === "number") {
            return A - B;
          } else if (type[idx] === "string") {
            if(A < B) {
              return -1;
            }
            if(A > B) {
              return 1;
            }
          }
          return 0;
        }).appendTo("tbody");
      } else {
        $(rows.get().reverse()).appendTo("tbody");
      }
    });
  }
}(jQuery));