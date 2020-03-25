(function($) {
  $.fn.table = function(metadata) {
    // this fucking shit
    var stripQuotes = function(s) {
      return s.replace(/['"]+\g/, '');
    }

    const { columns, data, width, pagination } = metadata;
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
      <table style="width: ${stripQuotes(width)}">
        <thead style="background-color: #0f007c; color: #fff;">
          <th style="border-color: #fff;"><input type="checkbox" id="select_all" value="select_all"></th>
          ${headers.map(function(item, index) {
            return `<th data-idx="${index}" style="width: ${stripQuotes(widths[index])}; border-color: #fff;">${item}</th>`
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
      <div class="pagination_container">
        <nav>
          <ul class="pagination">
            <li data-page="prev">
              <span> < <span class="sr-only">(current)</span></span>
            </li>
            <li data-page="next" id="prev">
              <span> > <span class="sr-only">(current)</span></span>
            </li>
          </ul>
        </nav>
      </div>
    `)

      
    // pagination
    let lastPage = 1;
    let trnum = 0;
    const maxRows = pagination.limit;
    let totalRows = $("table tbody tr").length;

    var limitPaging = function() {
      if($('.pagination li').length > 7) {
        if ($('.pagination li.active').attr('data-page') <= 3) {
          $('.pagination li:gt(5)').hide();
          $('.pagination li:lt(5)').show();
        }
        if ($('.pagination li.active').attr('data-page') > 3) {
          $('.pagination li:gt(0)').hide();
          $('.pagination [data-page="next"]').show();
          let x = parseInt($('.pagination li.active').attri('data-page')) - 2;
          let y = parseInt($('.pagination li.active').attri('data-page')) + 2;
          for (let i = x; i <= y; i++) {
            $(`.pagination [data-page="${i}"]`).show();
          }
        }
      }
    }

    $(this).find("table tbody tr").each(function() {
      trnum++;
      if (trnum > maxRows) {
        $(this).hide();
      } 
      if (trnum <= maxRows) {
        $(this).show();
      }
    });

    if (totalRows > maxRows) {
      let pagenum = Math.ceil(totalRows / maxRows);
      for (let i = 1; i <= pagenum; i++) {
        $(".pagination #prev").before(`
          <li data-page="${i}">
            <span>${i}<span class="sr-only">(current)</span></span>
          </li>
        `).show();
      }
    }

    $('.pagination [data-page="1"]').addClass('active');
    $('.pagination').on('click', 'li', function(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      let pageNum = $(this).attr('data-page');
      if (pageNum == 'prev') {
        if (lastPage == 1) {
          return;
        }
        pageNum = --lastPage;
      }
      if (pageNum == 'next') {
        if (lastPage == $('.pagination li').length - 2) {
          return;
        }
        pageNum = ++lastPage;
      }
      lastPage = pageNum;
      $('.pagination li').removeClass('active');
      $(`.pagination [data-page=${lastPage}]`).addClass('active');
      limitPaging();
      let trIndex = 0;
      $('table tbody tr').each(function() {
        trIndex++;
        if (trIndex > maxRows * pageNum || trIndex <= maxRows * pageNum - maxRows) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });

    limitPaging();

    // sort
    $(this).find("thead").on("click", "th", function() {
      const idx = $(this).attr("data-idx");
      let rows = $(this).closest("table").find("tbody tr");
      let asc = $(this).attr("data-asc");
      if ($(this).children("input:checkbox").length) {
        return;
      }
      if (typeof asc === typeof undefined || asc === false) {
        $(this).attr("data-asc", 1);
        trnum = 0;
        rows.sort(function(a, b) {
          var A = $(a).find('td').eq(parseInt(idx) + 1).html();
          var B = $(b).find('td').eq(parseInt(idx) + 1).html();
          if (type[idx] === "number") {
            console.log("sort number")
            return A - B;
          } else if (type[idx] === "string") {
            return A.localeCompare(B);
          }
          return 0;
        }).appendTo("tbody");
      } else {
        trnum = 0;
        $(rows.get().reverse()).appendTo("tbody");
      }

      let trIndex = 0;
      let pageNum = $('.pagination li.active').attr('data-page');

      $('table tbody tr').each(function() {
        trIndex++;
        if (trIndex > maxRows * pageNum || trIndex <= maxRows * pageNum - maxRows) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });
  

  }
}(jQuery));