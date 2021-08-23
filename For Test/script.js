$(function () {
     


    $('#mytable thead tr.filters th').each(function () {
        var title = $(this).text();


        if ($(this).hasClass("input-filter")) {


            $(this).html('<input name ="' + $.trim(title).replace(/ /g, '') + '" type="text" class = "form-control" placeholder="Search ' + $.trim(title) + '" />');
        }
        else if ($(this).hasClass("date-filter")) {

            $(this).html('<div class="input-prepend input-group"><span class="add-on input-group-addon"><i class="glyphicon glyphicon-calendar fa fa-calendar"></i></span><input type="text" style="width: 200px" name="' + $.trim(title).replace(/ /g, '') + '"  placeholder="Search ' + $.trim(title) + '" class="form-control daterange"/></div>');

        }

    });

        

     // DataTable
     var table = $("#mytable").DataTable({
                  
         dom: "rBftlip",

         buttons: [
         {
             extend: 'collection',
             text: 'Export',
             buttons:
                 [
                            
                     {
                         extend: "copy",
                         exportOptions: { columns: ':visible:not(:last-child)' }, //last column has the action types detail/edit/delete
                         footer:true
                     },
                     {
                         extend: "csv",
                         exportOptions: { columns: ':visible:not(:last-child)' },
                         footer: true
                     },
                     {
                         extend: "excel",
                         exportOptions: { columns: ':visible:not(:last-child)' },
                         footer:true
                     },
                     {
                         extend: "pdf",
                         exportOptions: { columns: ':visible:not(:last-child)' },
                         footer:true
                     },
                     {
                         extend: "print",
                         exportOptions: { columns: ':visible:not(:last-child)' },
                         footer: true
                     }

                 ]
         }
         ],
        
         responsive: true,
         "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
         orderCellsTop: true,
         scrollX: true,
         colReorder: true,
                 

         language: {
             search: '<div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>',
             searchPlaceholder: 'Search all columns',
             lengthMenu: '<div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-menu-hamburger"></span></span>_MENU_</div>',
             processing: "<img src='../Content/images/ajax-loader.gif'>"
         },
                
         processing: true,


         "initComplete": function (settings, json) {
             //  $("#mytable_processing").css("visibility", "hidden");
             $('#mytable').fadeIn();
         },
             

       
         "footerCallback": function( tfoot, data, start, end, display ) {
             var info = $('#mytable').DataTable().page.info();
             $(tfoot).find('td').eq(0).html("Total Count: " + info.recordsDisplay);

                  
         },
       
     });

     new $.fn.dataTable.Buttons(table, {
         buttons: [
           {
               extend: 'colvis',
               text: 'Show/Hide Columns'

           },

         ]
     });

     //add button to top
     table.buttons(0, null).container().prependTo(
           table.table().container()
       );
             

     //remove class from search filter
     ($("#mytable_filter input").removeClass("input-sm"));



   

     //instantiate datepicker and choose your format of the dates
     $('.daterange').daterangepicker({
         ranges: {
             "Today": [moment(), moment()],
             'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
             '7 last days': [moment().subtract(6, 'days'), moment()],
             '30 last days': [moment().subtract(29, 'days'), moment()],
             'This month': [moment().startOf('month'), moment().endOf('month')],
             'Last month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
         },
         autoUpdateInput: false,
         opens:"left",
         locale: {
             cancelLabel: 'Clear',
             format: 'DD-MMM-YYYY'
         }
     });

     
    // $.fn.dataTableExt.afnFiltering = new Array();

    //get column index for date range
     var visiblecolumnIndex;
     var dataColumnIndex;  //current data column to work with
     
     $("#mytable_wrapper thead").on("mousedown", "th", function (event) {
         visiblecolumnIndex = $(this).parent().children().index($(this));
         dataColumnIndex = $("tr:first-child").children(':eq(' + visiblecolumnIndex + ')').attr('data-column-index');
        
     });

  
     var startDate;
     var endDate;



    var DateFilterFunction = (function (settings, data, iDataIndex) {

        var filterstart = startDate;
        var filterend = endDate; 
         var iStartDateCol = dataColumnIndex;
         var iEndDateCol = dataColumnIndex;

         var tabledatestart = data[iStartDateCol] !== "" ? moment(data[iStartDateCol], "DD-MMM-YYYY") : data[iStartDateCol];
         var tabledateend = data[iEndDateCol] !== "" ? moment(data[iEndDateCol], "DD-MMM-YYYY") : data[iEndDateCol];



         if (filterstart === "" && filterend === "") {
             return true;
         }

         else if ((moment(filterstart, "DD-MMM-YYYY").isSame(tabledatestart) || moment(filterstart, "DD-MMM-YYYY").isBefore(tabledatestart)) && filterend === "") {
             return true;
         }
         else if ((moment(filterstart, "DD-MMM-YYYY").isSame(tabledatestart) || moment(filterstart, "DD-MMM-YYYY").isAfter(tabledatestart)) && filterstart === "") {
             return true;
         }
         else if ((moment(filterstart, "DD-MMM-YYYY").isSame(tabledatestart) || moment(filterstart, "DD-MMM-YYYY").isBefore(tabledatestart)) && (moment(filterend, "DD-MMM-YYYY").isSame(tabledateend) || moment(filterend, "DD-MMM-YYYY").isAfter(tabledateend))) {
             return true;
         }

         return false;


     });




    $(".daterange", this).on('apply.daterangepicker', function (ev, picker) {
        ev.preventDefault();
        $(this).val(picker.startDate.format('DD-MMM-YYYY') + ' to ' + picker.endDate.format('DD-MMM-YYYY'));
        startDate = picker.startDate.format('DD-MMM-YYYY');
        endDate = picker.endDate.format('DD-MMM-YYYY');
        $.fn.dataTableExt.afnFiltering.push(DateFilterFunction);

        table.draw();
        
    });

    $(".daterange", this).on('cancel.daterangepicker', function (ev, picker) {
        ev.preventDefault();
        $(this).val('');
        startDate = '';
        endDate = '';
        $.fn.dataTableExt.afnFiltering.push(DateFilterFunction);

        table.draw();


    });

    
        
     //hide unnecessary columns
     var column = table.columns($('.HideColumn'));
     // Toggle the visibility
     column.visible(!column.visible());

     // Apply the search
     $.each($('.input-filter', table.table().header()), function () {
         var column = table.column($(this).index());
         //onsole.log(column);
         $('input', this).on('keyup change', function () {
             if (column.search() !== this.value) {
                 column
                     .search(this.value)
                     .draw();
             }
         });
     });
    

 
      

 }); /////////////////////// end of Datatable function
