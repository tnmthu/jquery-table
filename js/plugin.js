(function($) {
  $.fn.table = function(metadata) {
    // UTILITY
    var stripQuotes = function(s) {
      return s.replace(/['"]+\g/, '');
    }

    const { columns, data, width, pagination, resizable = false, sort = false } = metadata;
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

    $(this).empty();
    // đổ data 
    $(this).append(`
      <table style="width: ${stripQuotes(width)}">
        <thead>
          <th>
            <input class="checkbox" type="checkbox" id="select_all" value="select_all">
            <label for="select_all"></label>
          </th>
          ${headers.map(function(item, index) {
            return `
            <th data-idx="${index}" style="width: ${stripQuotes(widths[index])};">
              <div>${item}</div>
              <div class="sort_icon">
                <i class="arr__up fas fa-angle-up fa-xs"></i>
                <i class="arr__down fas fa-angle-down fa-xs"></i>
              </div>
            </th>`
          }).join("")}
        </thead>
        <tbody>
          ${data.map(function(item) {
            return `
            <tr id="${item["id"]}">
              <td>
                <input class="checkbox" type="checkbox" id="select_${item["id"]}">
                <label for="select_${item["id"]}"></label>
              </td>
              ${dataNames.map(function(elem, index) {
                return (type[index] === "number") ? 
                `<td class="${elem}">${parseInt(item[elem]).toLocaleString("en")}</td>`
                : 
                `<td class="${elem}">${item[elem]}</td>`
              }).join("")}
            </tr>
            `
          }).join("")}
        </tbody>
      </table>
      <div class="pagination_container">
        <nav>
          <ul class="pagination">
            
          </ul>
        </nav>
      </div>
    `);
      
    // PAGINATION
    let lastPage = 1;
    let trnum = 0;
    const maxRows = pagination.limit;
    // let totalRows = $("table tbody tr").length;

    // show only 5 pages if number of page > 10
    var limitPaging = function() {
      if($('.pagination li').length > 10) {
        // if current page is less than 3 show 5 hide the rest 
        if ($('.pagination li.active').attr('data-page') <= 3) {
          $('.pagination li:gt(5)').hide();
          $('.pagination li:lt(5)').show();
          $('.pagination [data-page="next"]').show(); // show the > button
        }
        // if current page > 3 show +- 2 li 
        if ($('.pagination li.active').attr('data-page') > 3) {
          $('.pagination li:gt(0)').hide(); // hide all except < btn
          $('.pagination [data-page="next"]').show(); // show > btn
          let x = parseInt($('.pagination li.active').attr('data-page')) - 2; // calc only 5 neighbor pages
          let y = parseInt($('.pagination li.active').attr('data-page')) + 2;
          for (let i = x; i <= y; i++) {
            $(`.pagination [data-page="${i}"]`).show();
          }
        }
      }
    }

    // only show rows upto max row
    $(this).find("table tbody tr").each(function() {
      trnum++;
      if (trnum > maxRows) {
        $(this).hide();
      } 
      if (trnum <= maxRows) {
        $(this).show();
      }
    });

    // show number of pages at the pagination
    let paginationNum = function(current) {
      if ($("table tbody tr").length > maxRows) {
        let pagenum = Math.ceil($("table tbody tr").length / maxRows);
        $(".pagination").empty().append(`
          <li data-page="prev">
            <span> < <span class="sr-only">(current)</span></span>
          </li>
          <li data-page="next" id="prev">
            <span> > <span class="sr-only">(current)</span></span>
          </li>
        `);
        for (let i = 1; i <= pagenum; i++) { // sr-only: hide information intended only for screen readers
          $(".pagination #prev").before(`
            <li data-page="${i}" ${i == current ? 'class="active"' : ''}>
              <span>${i}<span class="sr-only">(current)</span></span> 
            </li>
          `).show();
        }
      }
    }
    
    paginationNum(1);

    $('.pagination [data-page="1"]').addClass('active'); // starting page is 1
    $('.pagination').on('click', 'li', function(e) {
      e.stopImmediatePropagation(); // stoppropagationimmediate: prevent every event from running, stoppropagation: only prevent parents event
      e.preventDefault(); 
      let pageNum = $(this).attr('data-page');
      if (pageNum == 'prev') {
        // if alr on page 1 
        if (lastPage == 1) {
          return;
        }
        pageNum = --lastPage;
      }
      if (pageNum == 'next') {
        if (lastPage == $('.pagination li').length - 2) { // if alr on last page (- the 2 nav btn) 
          return;
        }
        pageNum = ++lastPage;
      }
      lastPage = pageNum;
      $('.pagination li').removeClass('active');
      $(`.pagination [data-page=${pageNum}]`).addClass('active');
      limitPaging();
      // rowIndex for page
      let trIndex = 0;
      $('table tbody tr').each(function() {
        trIndex++;
        if (trIndex > maxRows * pageNum || trIndex <= maxRows * pageNum - maxRows) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
      paginationNum(pageNum);
    });
    limitPaging();

    // SORT UTILITIES
    let toggleArrow = function(e) {
      let up = $(e).find(".arr__up");
      let down = $(e).find(".arr__down");
      if (up.hasClass("blur")) {
        up.removeClass("blur");
        down.addClass("blur");
        return;
      }
      if (down.hasClass("blur")) {
        down.removeClass("blur");
        up.addClass("blur");
        return;
      }
    }
    // SORT
    if (sort) {
      $(this).find("thead").on("click", "th:gt(0)", function() { // minus the check all header
        const idx = $(this).attr("data-idx");
        let rows = $(this).closest("table").find("tbody tr");
        let asc = $(this).attr("data-asc");
        $(this).siblings().removeAttr("data-asc"); // reset for other headers
        $(this).siblings().find(".arr__up, .arr__down").removeClass("blur");
  
        if ($(this).children("input:checkbox").length) { // no sort for select_all header
          return;
        }

        if (typeof asc === typeof undefined || asc === false) { // if current header is reset
          $(this).attr("data-asc", 1);
          $(this).find(".arr__down").addClass("blur");
          trnum = 0;
          // sort ascending
          rows.sort(function(a, b) {
            var A = $(a).find('td').eq(parseInt(idx) + 1).html();
            var B = $(b).find('td').eq(parseInt(idx) + 1).html();
            if (type[idx] === "number") {
              return parseInt(A.replace(/,/g, "")) - parseInt(B.replace(/,/g, ""));
            } else if (type[idx] === "string") {
              return A.localeCompare(B);
            }
            return 0;
          }).appendTo("tbody");
        } else {
          // sort descending when header is not reset
          trnum = 0;
          $(rows.get().reverse()).appendTo("tbody");
          toggleArrow(this);
        }
  
        // get according rows for each page 
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
        limitPaging();
      });
    }

    // RESIZABLE COLUMNS
    if (resizable) {
      let isColResizing = false;
      let resizingPosX = 0;
      let table = $(this).find("table");
      let thead = $(this).find("table thead");
  
      thead.find("th").each(function() {
        $(this).css("position", "relative");
        if ($(this).is(":not(:last-child)")) { // not resizable for most right col
          // add resizer class for each header
          $(this).append(`
            <div class="resizer" style='position:absolute; top:0px; right:-3px; bottom:0px; width:6px; z-index:999; background:transparent; cursor:col-resize'>
            </div>
          `);
        }
      });
  
      // release mouse -> done resizing
      $(document).mouseup(function(e) {
        thead.find("th").removeClass("resizing");
        isColResizing = false;
        $('table thead th, table tbody td').css('pointer-events', 'auto');
        e.stopPropagation();
      });
  
      // mouse pressed
      table.find(".resizer").mousedown(function(e) {
        thead.find("th").removeClass("resizing");
        $(this).closest("th").addClass("resizing");
        resizingPosX = e.pageX; // get the horizontal coordinate
        isColResizing = true;
        $('table thead th, table tbody td').css('pointer-events', 'none');
        e.stopPropagation();
      });
  
      table.mousemove(function(e) {
        if (isColResizing) {
          let resizing = thead.find("th.resizing .resizer");
  
          if (resizing.length == 1) {
            let nextRow = thead.find("th.resizing + th"); // get th immidiately after the resizing
            let pageX = e.pageX || 0;
            let widthDiff = pageX - resizingPosX;
            let setWidth = resizing.closest("th").innerWidth() + widthDiff;
            let nextRowWidth = nextRow.innerWidth() - widthDiff;
            if (resizingPosX != 0 && widthDiff != 0 && setWidth > 50 && nextRowWidth > 50) {
              resizing.closest("th").innerWidth(setWidth);
              resizingPosX = e.pageX;
              nextRow.innerWidth(nextRowWidth);
            }
          }
        }
      });
    }    
  }
}(jQuery));