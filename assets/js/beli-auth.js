jQuery( function ( $ ) {

    // show popup
    $( '#readerInfoAuthenticateFormPopup' ).show();
    hideLoading();

    /**
	 * authenticate reader info on click
	 */
	$( '#readerInfoAuthenticateDataByPostApi' ).on( 'click', function ( e ) {
		checkDataByPostApi();
	} );


    $( '#readerInfoAuthenticateClosePopup' ).on( 'click', function ( e ) {
		getDataInit();
	} );
    


    function checkDataByPostApi(){
        var urlApi = (window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/check'
        //var urlApi = 'http://localhost/beli/wp-json/readerinfo/v1/check';

        // call function clear Error
        clearMessage();

        var email = $("#emailAuthenticate").val();
        var code = $("#codeAuthenticate").val();
        var postId = $("#postId").val();
        var isError = false;

        // validate email
        if(!email){
            $("#emailAuthenticateError").text("Nhập email hoặc số điện thoại là bắt buộc");
            isError = true;
        }else{
            if(validateEmail(email) || validatePhoneNumber(email)){
            } else {
                $("#emailAuthenticateError").text("Hãy nhập địa chỉ email hoặc số điện thoại");
                isError = true;
            }
        }

        // validate code
        if(!code){
            $("#codeAuthenticateError").text("Code là bắt buộc");
            isError = true;
        }

        if(isError){
            return;
        }

        var dataApi={}

        if(validateEmail(email)){
            dataApi={
                'email': email,
                'code': code,
                'postId': postId,
                'typeCheck': 'email'
            };
        } else {
            dataApi={
                'email': email,
                'code': code,
                'postId': postId,
                'typeCheck': 'phoneNumber'
            };
        }

        $('#readerInfoAuthenticateDataByPostApi').prop('disabled', true);
        showLoading();
        $.ajax({
        url: urlApi,
        type: 'POST',
        data: dataApi,
        dataType: "json"
        }).done(function(data){
            if(data.result){
                $("#readerInfoAuthenticateResultSuccess").text("Xác thực thành công.");
                $( '#readerInfoAuthenticateFormPopup' ).hide();

                
                // save info user to localStorage
                localStorage.setItem("emailUser", data.email);
                localStorage.setItem("codeUser", code);

                // save historiSearchList
                localStorage.setItem("historiSearchList", data.listHistoriSearch);

                // save typeMapSearchList
                localStorage.setItem("typeMapSearchList", data.listTypeMapSearch);

                // save typeMapSearchList
                localStorage.setItem("userType", data.userType);

                // load init page - disable form-main
                $('#form-main').show();

                //create List HistoriSearch in layout
                createListHistoriSearch();

                //create List TypeMapSearch in layout
                createListTypeMapSearch();
            } else{
                $("#readerInfoAuthenticateResultError").text("Email(hoặc số điện thoại) hoặc code chưa đúng, xin hãy thử lại.");
            }
            $('#readerInfoAuthenticateDataByPostApi').prop('disabled', false);
            hideLoading()
        }).fail(function(error){
            $("#readerInfoAuthenticateResultError").text("Email hoặc code chưa đúng, xin hãy thử lại.");
            $('#readerInfoAuthenticateDataByPostApi').prop('disabled', false);
            hideLoading()
        });
    }

    function getDataInit(){
        var urlApi = (window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/getDataInit'
        //var urlApi = 'http://localhost/beli/wp-json/readerinfo/v1/getDataInit';

        showLoading();

        $.ajax({
        url: urlApi,
        type: 'POST',
        data: null,
        dataType: "json"
        }).done(function(data){
            $( '#readerInfoAuthenticateFormPopup' ).hide();
        
            // save typeMapSearchList
            localStorage.setItem("typeMapSearchList", data.listTypeMapSearch);

            // set user is 'khach'
            localStorage.setItem("userType", 'khach');

            // load init page - disable form-main
            $('#form-main').show();

            //create List TypeMapSearch in layout
            createListTypeMapSearch();
            hideLoading()
        }).fail(function(error){
            hideLoading()
        });
    }

    function createListHistoriSearch(){

        let historiSearchList = localStorage.getItem("historiSearchList");
        const res = JSON.parse(historiSearchList);
        let listOption = '<option value=""></option>';
        let item = 0;
        if (Array.isArray(res)) {
            for (let element of res) {
                listOption = listOption + '<option value="' + item + '">' + element.nameSearch1 + '</option>'
                item++;
            }
        }
        $('#historiSearch').html(listOption);
    }

    function createListTypeMapSearch(){
        let typeMapSearchList = localStorage.getItem("typeMapSearchList");
        let res = typeMapSearchList.split(',');
        let listOption = '';
        if (Array.isArray(res)) {
            for (let element of res) {
                listOption = listOption + '<option value="' + element + '">' + element + '</option>'
            }
        }
        $('#typeMapSearch').html(listOption);
    }

    function validateEmail($email) {
        var emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailReg.test( $email );
    }

    function validatePhoneNumber($phoneNumber) {
        var phoneRegex = /^(?:\+?\d{1,3})?(\d{9,15})$/;
        if (phoneRegex.test($phoneNumber)) {
            // Số điện thoại hợp lệ!
            return true
        } else {
            // Số điện thoại không hợp lệ!
            return false
        }
    }

    function clearMessage() {
        $(".noti-error").text("");
        $(".noti-success").text("");
    }

    function showLoading() {
        $(".readerInfo-loadingPage").show();
    }

    function hideLoading() {
        $(".readerInfo-loadingPage").hide();
    }
});
