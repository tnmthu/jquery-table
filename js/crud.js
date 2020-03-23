$(document).ready(function(){
  // get all emp
  $.fn.getAllEmp = function() {
    $.ajax({
      url: "http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo",
      type: "GET",
      success: function(res) {
        $("#table tbody").empty();
        for (let i = 0, n = res.length; i < n; i++) {
          $("#table tbody").append(`<tr id="${res[i]["id"]}">
          <td>
            <input type="checkbox" id="select_${i}" value="select_${i}">
          </td>
          <td>${res[i]["id"]}</td>
          <td>${res[i]["employee_name"]}</td>
          <td>${res[i]["employee_age"]}</td>
          <td>${res[i]["employee_salary"]}</td>
          </tr>`)
        }
      },
      error: function() {
        console.log("error fetch all");
      }
    });
  }
  $.fn.getAllEmp();  

  let addedEmps = [];

  $.fn.saveBtnClicked = function() {
    addedEmps.forEach(elem => {
      $.ajax({
        url: "http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo",
        type: "POST",
        data: elem,
        success: function() {
          $.fn.getAllEmp();
        },
        error: function() {
          console.log("error save add");
        }
      }); 
    })
  }
  $("#btn__save").click(function(){
    $.fn.saveBtnClicked();
  })

  $.fn.addNewEmp = function(values) {
    $("#table tbody").prepend(`<tr>
          <td>
            <input type="checkbox">
          </td>
          <td></td>
          <td>${values["employee_name"]}</td>
          <td>${values["employee_age"]}</td>
          <td>${values["employee_salary"]}</td>
          </tr>`);
  }
  $("#btn__add").click(function() {
    console.log("help", $("emp_salary"))
    let values = {
      employee_name: $("#emp_name").val(),
      employee_salary: $("#emp_salary").val(),
      employee_age: $("#emp_age").val(),
    }
    addedEmps.push(values);
    $.fn.addNewEmp(values);
  });

  // delete row
  $.fn.delEmp = function() {
    
  }

  // update emp info
  // $.fn.updateEmp = function(id, values) {
  //   $.ajax({
  //     url: `http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo/${id}`,
  //     type: "PUT",
  //     data: values,
  //     success: function(res) {
  //       console.log(res);
  //     },
  //     error: function() {
  //       console.log("error update");
  //     }
  //   });
  // }
});