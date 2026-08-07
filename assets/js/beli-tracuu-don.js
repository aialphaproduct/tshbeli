jQuery( function ( $ ) {
	$(document).ready(function () {
            let firstSubmit = true;
            $("#hoTen, #inputTenThuongGoi, #ngay, #thang, #nam").on("change", () => {
                if (!firstSubmit) {
                    validateForm();
                }
            });

            $("#thanso").submit(async function (e) {
                e.preventDefault();
                firstSubmit = false;
                validateForm();
                if(!validateForm()) return;
                // trung-hx add source start
                // xác thực thông tin người dùng
                if(!validateUser()){
                    alert("Chưa xác thực thông tin người dùng");
                    return;
                }

                showLoadingPopup();

                await new Promise(resolve => setTimeout(resolve, 50));
                
                // call api to save data search
                if (!saveHistoriSearch()){
                    return;
                }
                // displayData by admin setting
                displayData()

                // update soulPlan
                $("#soulPlan").html(
                    '<div style="text-align:center;">' +
                    'SOUL PLAN<br>' +
                    $("#hoTen").val() +
                    '</div>'
                );

                // update MA TRAN TAM LY
                $("#maTranTamLy").html(
                    '<div style="text-align:center;">' +
                    'MA TRẬN TÂM LÝ<br>' +
                    $("#hoTen").val() +
                    '</div>'
                );
                // trung-hx add source end
                showData();
                //! ---------- Xử lý input -----------
                var hoVaTen = $("#hoTen").val();
                var tenThuongGoi = $("#inputTenThuongGoi").val();

                // update ui name
                $("#hoVaTen").html(hoVaTen);
                $("#tenThuongGoi1").html(tenThuongGoi);
                $("#hoVaTen2").html(hoVaTen);

                hoVaTen = transferNameToUnMarked(hoVaTen);
                tenThuongGoi = transferNameToUnMarked(tenThuongGoi);
                var inputNgay = parseInt($("#ngay").val(), 10);
                var inputThang = parseInt($("#thang").val(), 10);
                var inputNam = parseInt($("#nam").val(), 10);
                var selectedOption = $('input[name="lich"]:checked').val();
                var loaiLich = "DL";
                var result = [inputNgay, inputThang, inputNam].join("/");
                if (selectedOption === "amLich") {
                    loaiLich = "AL";
                    result = amsangduong(inputNgay, inputThang, inputNam, 0, 7);
                    result = formatDate(result)
                }
                else if(selectedOption === "amLichNhuan") {
                    loaiLich = "ALN";
                    result = amsangduong(inputNgay, inputThang, inputNam, 1, 7);
                    if(!result) {
                        alert("Năm " + inputNam + " không phải năm nhuận!");
                        return;
                    }
                    result = formatDate(result)
                }
                var arrDate = result.split("/");
                inputNgay = parseInt(arrDate[0], 10);
                inputThang = parseInt(arrDate[1], 10);
                inputNam = parseInt(arrDate[2], 10);
            
                
                $("#screenshot-btn").click(function (e) {
                    const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;
                    console.log("isMobile", isMobile);
                    if (isMobile) {
                        document.body.style.width = "1924px";
                        document.body.style.transform = "scale(1)";
                        document.body.style.transformOrigin = "top left";

                        $(".layout-desktop-5").removeClass("md:col-span-12");
                        $(".layout-desktop-5").removeClass("sm:col-span-12");
                        $(".layout-desktop-5").removeClass("max-sm:col-span-12");
                        $(".layout-desktop-5").addClass("md:col-span-5");
                        $(".layout-desktop-5").addClass("sm:col-span-5");
                        $(".layout-desktop-5").addClass("max-sm:col-span-5");
                        
                        $(".layout-desktop-7").removeClass("md:col-span-12");
                        $(".layout-desktop-7").removeClass("sm:col-span-12");
                        $(".layout-desktop-7").removeClass("max-sm:col-span-12");
                        $(".layout-desktop-7").addClass("md:col-span-7");
                        $(".layout-desktop-7").addClass("sm:col-span-7");
                        $(".layout-desktop-7").addClass("max-sm:col-span-7");

                        $(".layout-desktop-4").removeClass("sm:col-span-12");
                        $(".layout-desktop-4").removeClass("max-sm:col-span-12");
                        $(".layout-desktop-4").addClass("sm:col-span-4");
                        $(".layout-desktop-4").addClass("max-sm:col-span-4");

                        $(".layout-desktop-6").removeClass("md:col-span-12");
                        $(".layout-desktop-6").removeClass("max-sm:col-span-12");
                        $(".layout-desktop-6").removeClass("sm:col-span-12");
                        $(".layout-desktop-6").addClass("md:col-span-6");
                        $(".layout-desktop-6").addClass("max-sm:col-span-6");
                        $(".layout-desktop-6").addClass("sm:col-span-6");
                    }

                    $("td").addClass("td-pdf-print");
                    $(".bieudongaysinh").addClass("td-pdf-print");
                    $(".bieudongaysinhvatenthuonggoi").addClass("td-pdf-print");
                    $(".bieudongaysinhvatendaydu").addClass("td-pdf-print");
                    $(".matrantamly").addClass("td-pdf-print");
                    $(".imgKimTuDo").addClass("imgKimTuDo-pdf-print");

                    requestAnimationFrame(function() {
                        capture = document.getElementById('capture');
                        if (!capture) {
                            console.error("Phần tử cần chụp không tồn tại trong DOM.");
                            return;
                        }

                        showLoading();
                        //let base64_image;
                        let emailUser = localStorage.getItem("emailUser");

                        if(!emailUser){
                            // Lấy thời gian hiện tại
                            var currentDateTime = new Date();
        
                            // Lấy các thành phần thời gian
                            var year = currentDateTime.getFullYear();
                            var month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, cộng thêm 1
                            var day = currentDateTime.getDate().toString().padStart(2, '0');
                            var hours = currentDateTime.getHours().toString().padStart(2, '0');
                            var minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
                            var seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
                            
                            // Tạo mã từ datetime, ví dụ: "20241220144510"
                            var datetimeCode = year + month + day + hours + minutes + seconds;
                            emailUser = datetimeCode;
                        }

                        const file_name =   emailUser + "_" +
                                            transferNameToUnMarked($("#hoTen").val()).replace(/ /g, "_") + "_" +
                                            transferNameToUnMarked($("#inputTenThuongGoi").val()) + "_" +
                                            [$("#ngay").val(), $("#thang").val(), $("#nam").val()].join("_") +
                                            ".png";

                        html2canvas(capture, {
                            useCORS: true, // Cho phép sử dụng CORS
                            allowTaint: true, // Cho phép tải các tài nguyên không
                            scale: isMobile ? 1 : 2 // Giảm độ phân giải ảnh cùng nguồn gốc 1
                        }).then(function (canvas) {
                            const base64_imageNew = canvas.toDataURL('image/png');
                            // call api save image
                            var urlApi = (window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/save_base64_image'
                            //var urlApi = 'http://localhost/beli/wp-json/readerinfo/v1/save_base64_image';
                            var dataApi={
                                'base64_image': base64_imageNew,
                                'file_name': file_name
                            };
                            //showLoading();
                            $.ajax({
                                url: urlApi,
                                async: false,
                                type: 'POST',
                                data: dataApi,
                                dataType: "json"
                                }).done(function(data){
                                    let result = data.result;
                                    let message = data.message;
                                    let file_url = data.fileUrl;
                
                                    if (!result){
                                        alert (message);
                                    }else {
                                        file_url = file_url + (file_url.includes('?') ? '&' : '?') + 'nocache=' + new Date().getTime();
                                        window.open(file_url, '_blank');
                                    }
                                    hideLoading();
                                    if (isMobile) {
                                        document.body.style.width = "100%";
                                        document.body.style.transform = "scale(1)";

                                        $(".layout-desktop-5").removeClass("md:col-span-5 sm:col-span-5 max-sm:col-span-5");
                                        $(".layout-desktop-5").addClass("md:col-span-12 sm:col-span-12 max-sm:col-span-12");

                                        $(".layout-desktop-7").removeClass("md:col-span-7 sm:col-span-7 max-sm:col-span-7");
                                        $(".layout-desktop-7").addClass("md:col-span-12 sm:col-span-12 max-sm:col-span-12");

                                        $(".layout-desktop-4").removeClass("sm:col-span-4 max-sm:col-span-4");
                                        $(".layout-desktop-4").addClass("sm:col-span-12 max-sm:col-span-12");

                                        $(".layout-desktop-6").removeClass("md:col-span-6 max-sm:col-span-6 sm:col-span-6");
                                        $(".layout-desktop-6").addClass("md:col-span-12 max-sm:col-span-12 sm:col-span-12");
                                    }

                                    $("td").removeClass("td-pdf-print");
                                    $(".bieudongaysinh").removeClass("td-pdf-print");
                                    $(".bieudongaysinhvatenthuonggoi").removeClass("td-pdf-print");
                                    $(".bieudongaysinhvatendaydu").removeClass("td-pdf-print");
                                    $(".matrantamly").removeClass("td-pdf-print");
                                    $(".imgKimTuDo").removeClass("imgKimTuDo-pdf-print");
                                }).fail(function(error){
                                    hideLoading();
                                    if (isMobile) {
                                        document.body.style.width = "100%";
                                        document.body.style.transform = "scale(1)";

                                        $(".layout-desktop-5").removeClass("md:col-span-5 sm:col-span-5 max-sm:col-span-5");
                                        $(".layout-desktop-5").addClass("md:col-span-12 sm:col-span-12 max-sm:col-span-12");

                                        $(".layout-desktop-7").removeClass("md:col-span-7 sm:col-span-7 max-sm:col-span-7");
                                        $(".layout-desktop-7").addClass("md:col-span-12 sm:col-span-12 max-sm:col-span-12");

                                        $(".layout-desktop-4").removeClass("sm:col-span-4 max-sm:col-span-4");
                                        $(".layout-desktop-4").addClass("sm:col-span-12 max-sm:col-span-12");

                                        $(".layout-desktop-6").removeClass("md:col-span-6 max-sm:col-span-6 sm:col-span-6");
                                        $(".layout-desktop-6").addClass("md:col-span-12 max-sm:col-span-12 sm:col-span-12");
                                    }
                                    $("td").removeClass("td-pdf-print");
                                    $(".bieudongaysinh").removeClass("td-pdf-print");
                                    $(".bieudongaysinhvatenthuonggoi").removeClass("td-pdf-print");
                                    $(".bieudongaysinhvatendaydu").removeClass("td-pdf-print");
                                    $(".matrantamly").removeClass("td-pdf-print");
                                    $(".imgKimTuDo").removeClass("imgKimTuDo-pdf-print");
                                    alert ("Tải bản đồ thất bại");
                                });
                        });
                    });

                    
                });

                var sinhNhat = parseInt(inputNgay, 10) + "/" + parseInt(inputThang, 10) + "/" + parseInt(inputNam, 10);
                //! ---------- END Xử lý input -----------

                //! ---------- Xử lý dữ liệu -----------

                var currentDate = new Date().getDate();
                var currentMonth = new Date().getMonth() + 1;
                dataResult = transferData(sinhNhat, hoVaTen, tenThuongGoi, inputNgay, inputThang, inputNam, currentDate, currentMonth);
                var duongDoi_Doc;
                var duongDoi_Ngang;
                var suMenhLon_Doc;
                var suMenhLon_Ngang;
                var ketNoi_Doc;
                var ketNoi_Ngang;
                var truongThanh_Doc;
                var truongThanh_Ngang;
                var linhHonNho_Doc;
                var linhHonNho_Ngang;
                var nhanCachNho_Doc;
                var nhanCachNho_Ngang;
                var nhanCachLon_Doc;
                var nhanCachLon_Ngang;
                var soMenhNho_Doc;
                var soMenhNho_Ngang;
                var ngaySinh_Doc;
                var ngaySinh_ChiSo;
                var tuDuyHopLy_Doc;
                var tuDuyHopLy_Ngang;
                var thieu;
                var phanHoiTiemThuc_Doc;
                var linhHonLon_Doc;
                var linhHonLon_Ngang;
                var diemBaoMat;
                var diemBaoMat_ChiSo;
                var namCaNhan_Doc;
                var namCaNhan_Ngang;
                var thangCaNhan_Ngang;
                var thangCaNhan_Doc;
                var ngayCaNhan_Ngang;
                var ngayCaNhan_Doc;
                var thaiDo_Doc;
                var thaiDo_Ngang;
                var canBang_Doc;
                var canBang_Ngang;
                var bonNamDinhCao;
                var bonDinhGiaiDoanCuocDoi_Ngang;
                var bieuDoNgaySinh;
                var maTranTamLy;
                var bieuDoNgaySinh_ThuongGoi;
                var bieuDoNgaySinh_DayDu;
                var bonThuThach;
                var thuThach1_Ngang;
                var thuThach2_Ngang;
                var thuThach4_Ngang;
                var noiTam;
                var noiTam_Doc;
                var noiTam_Ngang;
                var tuongTac;
                var tuongTac_Doc;
                var tuongTac_Ngang;
                var phatTrien;
                var phatTrien_Doc;
                var phatTrien_Ngang;

                if(dataResult.result){
                    duongDoi_Doc = dataResult.duongDoi_Doc;
                    duongDoi_Ngang = dataResult.duongDoi_Ngang;
                    suMenhLon_Doc = dataResult.suMenhLon_Doc;
                    suMenhLon_Ngang = dataResult.suMenhLon_Ngang;
                    ketNoi_Doc = dataResult.ketNoi_Doc;
                    ketNoi_Ngang = dataResult.ketNoi_Ngang;
                    truongThanh_Doc = dataResult.truongThanh_Doc;
                    truongThanh_Ngang = dataResult.truongThanh_Ngang;
                    linhHonNho_Doc = dataResult.linhHonNho_Doc;
                    linhHonNho_Ngang = dataResult.linhHonNho_Ngang;
                    nhanCachNho_Doc = dataResult.nhanCachNho_Doc;
                    nhanCachNho_Ngang = dataResult.nhanCachNho_Ngang;
                    nhanCachLon_Doc = dataResult.nhanCachLon_Doc;
                    nhanCachLon_Ngang = dataResult.nhanCachLon_Ngang;
                    soMenhNho_Doc = dataResult.soMenhNho_Doc;
                    soMenhNho_Ngang = dataResult.soMenhNho_Ngang;
                    ngaySinh_Doc = dataResult.ngaySinh_Doc;
                    ngaySinh_ChiSo = dataResult.ngaySinh_ChiSo;
                    tuDuyHopLy_Doc = dataResult.tuDuyHopLy_Doc;
                    tuDuyHopLy_Ngang = dataResult.tuDuyHopLy_Ngang;
                    thieu = dataResult.thieu;
                    phanHoiTiemThuc_Doc = dataResult.phanHoiTiemThuc_Doc;
                    linhHonLon_Doc = dataResult.linhHonLon_Doc;
                    linhHonLon_Ngang = dataResult.linhHonLon_Ngang;
                    diemBaoMat = dataResult.diemBaoMat;
                    diemBaoMat_ChiSo = dataResult.diemBaoMat_ChiSo;
                    namCaNhan_Doc = dataResult.namCaNhan_Doc;
                    namCaNhan_Ngang = dataResult.namCaNhan_Ngang;
                    thangCaNhan_Ngang = dataResult.thangCaNhan_Ngang;
                    thangCaNhan_Doc = dataResult.thangCaNhan_Doc;
                    ngayCaNhan_Ngang = dataResult.ngayCaNhan_Ngang;
                    ngayCaNhan_Doc = dataResult.ngayCaNhan_Doc;
                    thaiDo_Doc = dataResult.thaiDo_Doc;
                    thaiDo_Ngang = dataResult.thaiDo_Ngang;
                    canBang_Doc = dataResult.canBang_Doc;
                    canBang_Ngang = dataResult.canBang_Ngang;
                    bonNamDinhCao = dataResult.bonNamDinhCao;
                    bonDinhGiaiDoanCuocDoi_Ngang = dataResult.bonDinhGiaiDoanCuocDoi_Ngang;
                    bieuDoNgaySinh = dataResult.bieuDoNgaySinh;
                    maTranTamLy = dataResult.maTranTamLy;
                    bieuDoNgaySinh_ThuongGoi = dataResult.bieuDoNgaySinh_ThuongGoi;
                    bieuDoNgaySinh_DayDu = dataResult.bieuDoNgaySinh_DayDu;
                    bonThuThach = dataResult.bonThuThach;
                    thuThach1_Ngang = dataResult.thuThach1_Ngang;
                    thuThach2_Ngang = dataResult.thuThach2_Ngang;
                    thuThach4_Ngang = dataResult.thuThach4_Ngang;
                    noiTam = dataResult.noiTam;
                    noiTam_Doc = dataResult.noiTam_Doc;
                    noiTam_Ngang = dataResult.noiTam_Ngang;
                    tuongTac = dataResult.tuongTac;
                    tuongTac_Doc = dataResult.tuongTac_Doc;
                    tuongTac_Ngang = dataResult.tuongTac_Ngang;
                    phatTrien = dataResult.phatTrien;
                    phatTrien_Doc = dataResult.phatTrien_Doc;
                    phatTrien_Ngang = dataResult.phatTrien_Ngang;
                }
                var duongDoi_ChiSo = getChiSo(duongDoi_Doc, duongDoi_Ngang, false);
                var suMenhLon_ChiSo = getChiSo(suMenhLon_Doc, suMenhLon_Ngang, false);
                var ketNoi_ChiSo = getChiSo(ketNoi_Doc, ketNoi_Ngang, false);
                var truongThanh_ChiSo = getChiSo( truongThanh_Doc, truongThanh_Ngang, false);
                var linhHonNho_ChiSo = getChiSo(linhHonNho_Doc, linhHonNho_Ngang, false);
                var nhanCachNho_ChiSo = getChiSo( nhanCachNho_Doc, nhanCachNho_Ngang, false);
                var nhanCachLon_ChiSo = getChiSo( nhanCachLon_Doc, nhanCachLon_Ngang, false);
                var soMenhNho_ChiSo = getChiSo(soMenhNho_Doc, soMenhNho_Ngang, false);
                var tuDuyHopLy_ChiSo = getChiSo( tuDuyHopLy_Doc, tuDuyHopLy_Ngang, false);
                var linhHonLon_ChiSo = getChiSo(linhHonLon_Doc, linhHonLon_Ngang, false);
                var soMenhLon_Doc = suMenhLon_Doc;
                var soMenhLon_Ngang = suMenhLon_Ngang;
                var soMenhLon_ChiSo = getChiSo(soMenhLon_Doc, soMenhLon_Ngang, false);
                var thaiDo_ChiSo = getChiSo(thaiDo_Doc, thaiDo_Ngang, false);
                var canBang_ChiSo = getChiSo(canBang_Doc.ketQua, canBang_Ngang.ketQua, false);

                var namDinhCao1 = bonNamDinhCao[0];
                var tuoiDinhCao1 = namDinhCao1 - inputNam;
                var namVaTuoiDinhCao1 =
                    tuoiDinhCao1 + " Tuổi <br> Năm " + namDinhCao1;

                var namDinhCao2 = bonNamDinhCao[1];
                var tuoiDinhCao2 = namDinhCao2 - inputNam;
                var namVaTuoiDinhCao2 =
                    tuoiDinhCao2 + " Tuổi <br>Năm " + namDinhCao2;

                var namDinhCao3 = bonNamDinhCao[2];
                var tuoiDinhCao3 = namDinhCao3 - inputNam;
                var namVaTuoiDinhCao3 =
                    tuoiDinhCao3 + " Tuổi <br>Năm " + namDinhCao3;

                var namDinhCao4 = bonNamDinhCao[3];
                var tuoiDinhCao4 = namDinhCao4 - inputNam;
                var namVaTuoiDinhCao4 =
                    tuoiDinhCao4 + " Tuổi <br>Năm " + namDinhCao4;

                var bonDinhGiaiDoanCuocDoi_Doc =
                    BonDinhGiaiDoanCuocDoi_Doc(inputNgay, inputThang, inputNam).split("-");
                var dinh1_Doc = bonDinhGiaiDoanCuocDoi_Doc[0];
                var dinh2_Doc = bonDinhGiaiDoanCuocDoi_Doc[1];
                var dinh3_Doc = bonDinhGiaiDoanCuocDoi_Doc[2];
                var dinh4_Doc = bonDinhGiaiDoanCuocDoi_Doc[3];

                var dinh1_Ngang = bonDinhGiaiDoanCuocDoi_Ngang[0];
                var dinh2_Ngang = bonDinhGiaiDoanCuocDoi_Ngang[1];
                var dinh3_Ngang = bonDinhGiaiDoanCuocDoi_Ngang[2];
                var dinh4_Ngang = bonDinhGiaiDoanCuocDoi_Ngang[3];

                var namDinhCaoSo4_Thu1 = namDinhCao1 - 5;
                var tuoiDinhCaoSo4_Thu1 = namDinhCaoSo4_Thu1 - inputNam;
                var dinhCaoSo4_Thu1 =
                    tuoiDinhCaoSo4_Thu1 + " Tuổi (Năm " + namDinhCaoSo4_Thu1 + ")";

                var namDinhCaoSo4_Thu2 = namDinhCaoSo4_Thu1 + 9;
                var tuoiDinhCaoSo4_Thu2 = namDinhCaoSo4_Thu2 - inputNam;
                var dinhCaoSo4_Thu2 =
                    tuoiDinhCaoSo4_Thu2 + " Tuổi (Năm " + namDinhCaoSo4_Thu2 + ")";

                var namDinhCaoSo4_Thu3 = namDinhCaoSo4_Thu2 + 18;
                var tuoiDinhCaoSo4_Thu3 = namDinhCaoSo4_Thu3 - inputNam;
                var dinhCaoSo4_Thu3 =
                    tuoiDinhCaoSo4_Thu3 + " Tuổi (Năm " + namDinhCaoSo4_Thu3 + ")";

                var namDinhCaoSo4_Thu4 = namDinhCaoSo4_Thu3 + 27;
                var tuoiDinhCaoSo4_Thu4 = namDinhCaoSo4_Thu4 - inputNam;
                var dinhCaoSo4_Thu4 =
                    tuoiDinhCaoSo4_Thu4 + " Tuổi (Năm " + namDinhCaoSo4_Thu4 + ")";

                updateMaTranTamLyAndTamLyTinhNam_Nu(maTranTamLy);

                soulPlan_Process_UpdateUI(hoVaTen);
                
                updateBieuDoNgaySinh_ThuongGoi(bieuDoNgaySinh_ThuongGoi);
                
                updateBieuDoNgaySinh_DayDu(bieuDoNgaySinh_DayDu);

                const baChuKyVongDoi = BaChuKyVongDoi(inputNgay, inputThang, inputNam);
                const chuKyVongDoi_1 = baChuKyVongDoi.split("-")[0];
                const chuKyVongDoi_2 = baChuKyVongDoi.split("-")[1];
                const chuKyVongDoi_3 = baChuKyVongDoi.split("-")[2];

                var thuThach1_Doc = bonThuThach[0];
                var thuThach1 = thuThach1_Doc + " - " + thuThach1_Ngang;
                var thuThach2_Doc = transferHaiChuSoThanhMotChuSo(Math.abs(+getSoDon(chuKyVongDoi_2) - +getSoDon(chuKyVongDoi_3)));
                var thuThach2 = thuThach2_Doc + " - " + thuThach2_Ngang;
                var tempThuThach1_Ngang = thuThach1_Ngang;
                var tempThuThach2_Ngang = thuThach2_Ngang;
                if(thuThach1_Ngang.includes("/")) {
                    tempThuThach1_Ngang = thuThach1_Ngang.split("/")[0];
                }
                if(thuThach2_Ngang.includes("/")) {
                    tempThuThach2_Ngang = thuThach2_Ngang.split("/")[0];
                
                }
                var thuThach3_Doc = bonThuThach[2];
                var thuThach3_Ngang = transferHaiChuSoThanhMotChuSo(
                    Math.abs(+tempThuThach1_Ngang - +tempThuThach2_Ngang)
                );
                var thuThach3 = thuThach3_Doc + " - " + thuThach3_Ngang;

                var thuThach4_Doc = transferHaiChuSoThanhMotChuSo(Math.abs(+getSoDon(chuKyVongDoi_1) - +getSoDon(chuKyVongDoi_3)));
                var thuThach4 = thuThach4_Doc + " - " + thuThach4_Ngang;

                //! ----------Biểu đồ -----------
                const dataMaTrans = getNguHanhSumValuesForYears(inputNgay, inputThang);
                createChart(inputNgay, inputThang, dataMaTrans);

                //! ----------START Update task chỉ số cá nhân - 3 chỉ số PT-NT-TT -----------

                


                //! ----------END Update task chỉ số cá nhân - 3 chỉ số PT-NT-TT -----------

                //! ----------END Xử lý dữ liệu -----------

                //! ---------- Hiển thị dữ liệu -----------
                generateYearLabel();
                
                $("#ngaySinh").html(sinhNhat);
                if (hasRedColor(sinhNhat))
                    $("#ngaySinh").addClass("text-white bg-red-500");
                else {
                    $("#ngaySinh").removeClass("text-white bg-red-500");
                }

                const tuoi = new Date().getFullYear() - inputNam;
                const kiemTraDaQuaSinhNhat = (ngay, thang) => {
                    const homNay = new Date(); // ngay hien tai
                    const ngaySinhNhat = new Date(homNay.getFullYear(), thang - 1, ngay); // thang -1 vi trong js thang tinh tu 0 - 11
                    return homNay >= ngaySinhNhat;
                }
                if(tuoi > 0) {
                    $("#ngaySinh1").html(  sinhNhat + " - " + 
                        (kiemTraDaQuaSinhNhat(inputNgay, inputThang) ? (new Date().getFullYear() - inputNam) : (new Date().getFullYear() - inputNam - 1)) + " Tuổi");
                        
                }
                else {
                    $("#ngaySinh1").html(sinhNhat);
                }
            
                $("#ngayHienTai").html(getCurrentDate());
                $("#tenThuongGoi").html(tenThuongGoi);

                $("#duongDoi_Doc").html(duongDoi_Doc);
                $("#duongDoi_Ngang").html(duongDoi_Ngang);
                $("#duongDoi_ChiSo").html(duongDoi_ChiSo);
                if (hasRedColor(duongDoi_Doc))
                    $("#duongDoi_Doc").addClass("text-white bg-red-500");
                else $("#duongDoi_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(duongDoi_Ngang))
                    $("#duongDoi_Ngang").addClass("text-white bg-red-500");
                else $("#duongDoi_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(duongDoi_ChiSo))
                    $("#duongDoi_ChiSo").addClass("text-white bg-red-500");
                else $("#duongDoi_ChiSo").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, duongDoi_ChiSo))
                    $("#duongDoi_ChiSo").addClass("text-white bg-yellow-500");
                else $("#duongDoi_ChiSo").removeClass("text-white bg-yellow-500");
                

                $("#suMenhLon_Doc").html(suMenhLon_Doc);
                $("#suMenhLon_Ngang").html(suMenhLon_Ngang);
                $("#suMenhLon_ChiSo").html(suMenhLon_ChiSo);
                if (hasRedColor(suMenhLon_Doc))
                    $("#suMenhLon_Doc").addClass("text-white bg-red-500");
                else $("#suMenhLon_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(suMenhLon_Ngang))
                    $("#suMenhLon_Ngang").addClass("text-white bg-red-500");
                else $("#suMenhLon_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(suMenhLon_ChiSo))
                    $("#suMenhLon_ChiSo").addClass("text-white bg-red-500");
                else $("#suMenhLon_ChiSo").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, suMenhLon_ChiSo))
                    $("#suMenhLon_ChiSo").addClass("text-white bg-yellow-500");
                else $("#suMenhLon_ChiSo").removeClass("text-white bg-yellow-500");

                $("#suMenhLon1_Doc").html(suMenhLon_Doc);
                $("#suMenhLon1_Ngang").html(suMenhLon_Ngang);
                $("#suMenhLon1_ChiSo").html(suMenhLon_ChiSo);
                if (hasRedColor(suMenhLon_Doc))
                    $("#suMenhLon1_Doc").addClass("text-white bg-red-500");
                else $("#suMenhLon1_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(suMenhLon_Ngang))
                    $("#suMenhLon1_Ngang").addClass("text-white bg-red-500");
                else $("#suMenhLon1_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(suMenhLon_ChiSo))
                    $("#suMenhLon1_ChiSo").addClass("text-white bg-red-500");
                else $("#suMenhLon1_ChiSo").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, suMenhLon_ChiSo))
                    $("#suMenhLon1_ChiSo").addClass("text-white bg-yellow-500");
                else $("#suMenhLon1_ChiSo").removeClass("text-white bg-yellow-500");

                $("#ketNoi_Doc").html(ketNoi_Doc);
                $("#ketNoi_Ngang").html(ketNoi_Ngang);
                $("#ketNoi_ChiSo").html(ketNoi_ChiSo);
                if (hasRedColor(ketNoi_Doc))
                    $("#ketNoi_Doc").addClass("text-white bg-red-500");
                else $("#ketNoi_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(ketNoi_Ngang))
                    $("#ketNoi_Ngang").addClass("text-white bg-red-500");
                else $("#ketNoi_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(ketNoi_ChiSo))
                    $("#ketNoi_ChiSo").addClass("text-white bg-red-500");
                else $("#ketNoi_ChiSo").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, ketNoi_ChiSo))
                    $("#ketNoi_ChiSo").addClass("text-white bg-yellow-500");
                else $("#ketNoi_ChiSo").removeClass("text-white bg-yellow-500");

                $("#truongThanh_Doc").html(truongThanh_Doc);
                $("#truongThanh_Ngang").html(truongThanh_Ngang);
                $("#truongThanh_ChiSo").html(truongThanh_ChiSo);
                if (hasRedColor(truongThanh_Doc))
                    $("#truongThanh_Doc").addClass("text-white bg-red-500");
                else $("#truongThanh_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(truongThanh_Ngang))
                    $("#truongThanh_Ngang").addClass("text-white bg-red-500");
                else $("#truongThanh_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(truongThanh_ChiSo))
                    $("#truongThanh_ChiSo").addClass("text-white bg-red-500");
                else $("#truongThanh_ChiSo").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, truongThanh_ChiSo))
                    $("#truongThanh_ChiSo").addClass("text-white bg-yellow-500");
                else $("#truongThanh_ChiSo").removeClass("text-white bg-yellow-500");

                $("#linhHonNho_Doc").html(linhHonNho_Doc);
                $("#linhHonNho_Ngang").html(linhHonNho_Ngang);
                $("#linhHonNho_ChiSo").html(linhHonNho_ChiSo) ;
                if (hasRedColor(linhHonNho_Doc) )
                    $("#linhHonNho_Doc").addClass("text-white bg-red-500");
                else $("#linhHonNho_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(linhHonNho_Ngang))
                    $("#linhHonNho_Ngang").addClass("text-white bg-red-500");
                else $("#linhHonNho_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, linhHonNho_ChiSo))
                    $("#linhHonNho_ChiSo").addClass("text-white bg-yellow-500");
                else $("#linhHonNho_ChiSo").removeClass("text-white bg-yellow-500");

                $("#linhHonLon_Doc").html(linhHonLon_Doc);
                $("#linhHonLon_Ngang").html(linhHonLon_Ngang);
                $("#linhHonLon_ChiSo").html(linhHonLon_ChiSo) ;
                if (hasRedColor(linhHonLon_Doc) )
                    $("#linhHonLon_Doc").addClass("text-white bg-red-500");
                else $("#linhHonLon_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(linhHonLon_Ngang))
                    $("#linhHonLon_Ngang").addClass("text-white bg-red-500");
                else $("#linhHonLon_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, linhHonLon_ChiSo))
                    $("#linhHonLon_ChiSo").addClass("text-white bg-yellow-500");
                else $("#linhHonLon_ChiSo").removeClass("text-white bg-yellow-500");

                $("#nhanCachLon_Doc").html(nhanCachLon_Doc);
                $("#nhanCachLon_Ngang").html(nhanCachLon_Ngang);
                $("#nhanCachLon_ChiSo").html(nhanCachLon_ChiSo);
                if (hasRedColor(nhanCachLon_Doc))
                    $("#nhanCachLon_Doc").addClass("text-white bg-red-500");
                else $("#nhanCachLon_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(nhanCachLon_Ngang))
                    $("#nhanCachLon_Ngang").addClass("text-white bg-red-500");
                else $("#nhanCachLon_Ngang").removeClass("text-white bg-red-500");
        
                if (hasYellowColor(diemBaoMat_ChiSo, nhanCachLon_ChiSo))
                    $("#nhanCachLon_ChiSo").addClass("text-white bg-yellow-500");
                else $("#nhanCachLon_ChiSo").removeClass("text-white bg-yellow-500");

                $("#nhanCachNho_Doc").html(nhanCachNho_Doc);
                $("#nhanCachNho_Ngang").html(nhanCachNho_Ngang);
                $("#nhanCachNho_ChiSo").html(nhanCachNho_ChiSo);
                if (hasRedColor(nhanCachNho_Doc))
                    $("#nhanCachNho_Doc").addClass("text-white bg-red-500");
                else $("#nhanCachNho_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(nhanCachNho_Ngang))
                    $("#nhanCachNho_Ngang").addClass("text-white bg-red-500");
                else $("#nhanCachNho_Ngang").removeClass("text-white bg-red-500");
            
                if (hasYellowColor(diemBaoMat_ChiSo, nhanCachNho_ChiSo))
                    $("#nhanCachNho_ChiSo").addClass("text-white bg-yellow-500");
                else $("#nhanCachNho_ChiSo").removeClass("text-white bg-yellow-500");

                $("#soMenhNho_Doc").html(soMenhNho_Doc);
                $("#soMenhNho_Ngang").html(soMenhNho_Ngang);
                $("#soMenhNho_ChiSo").html(soMenhNho_ChiSo);
                if (hasRedColor(soMenhNho_Doc))
                    $("#soMenhNho_Doc").addClass("text-white bg-red-500");
                else $("#soMenhNho_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(soMenhNho_Ngang))
                    $("#soMenhNho_Ngang").addClass("text-white bg-red-500");
                else $("#soMenhNho_Ngang").removeClass("text-white bg-red-500");
            
                if (hasYellowColor(diemBaoMat_ChiSo, soMenhNho_ChiSo))
                    $("#soMenhNho_ChiSo").addClass("text-white bg-yellow-500");
                else $("#soMenhNho_ChiSo").removeClass("text-white bg-yellow-500");

                $("#ngaySinh_Doc").html(ngaySinh_Doc);
                $("#ngaySinh_ChiSo").html(ngaySinh_ChiSo);
                if (hasRedColor(ngaySinh_Doc))
                    $("#ngaySinh_Doc").addClass("text-white bg-red-500");
                else $("#ngaySinh_Doc").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, ngaySinh_ChiSo))
                    $("#ngaySinh_ChiSo").addClass("text-white bg-yellow-500");
                else $("#ngaySinh_ChiSo").removeClass("text-white bg-yellow-500");

                $("#tuDuyHopLy_Doc").html(tuDuyHopLy_Doc);
                $("#tuDuyHopLy_Ngang").html(tuDuyHopLy_Ngang);
                $("#tuDuyHopLy_ChiSo").html(tuDuyHopLy_ChiSo);
                if (hasRedColor(tuDuyHopLy_Doc))
                    $("#tuDuyHopLy_Doc").addClass("text-white bg-red-500");
                else $("#tuDuyHopLy_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(tuDuyHopLy_Ngang))
                    $("#tuDuyHopLy_Ngang").addClass("text-white bg-red-500");
                else $("#tuDuyHopLy_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, tuDuyHopLy_ChiSo))
                    $("#tuDuyHopLy_ChiSo").addClass("text-white bg-yellow-500");
                else $("#tuDuyHopLy_ChiSo").removeClass("text-white bg-yellow-500");

                $("#thieu").html(thieu);

                $("#phanHoiTiemThuc_ChiSo").html(phanHoiTiemThuc_Doc);
                if (hasRedColor(phanHoiTiemThuc_Doc))
                    $("#phanHoiTiemThuc_Doc").addClass("text-white bg-red-500");
                else $("#phanHoiTiemThuc_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(phanHoiTiemThuc_Doc))
                    $("#phanHoiTiemThuc_ChiSo").addClass("text-white bg-red-500");
                else $("#phanHoiTiemThuc_ChiSo").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, phanHoiTiemThuc_Doc))
                    $("#phanHoiTiemThuc_ChiSo").addClass("text-white bg-yellow-500");
                else
                    $("#phanHoiTiemThuc_ChiSo").removeClass("text-white bg-yellow-500");
                $("#diemBaoMat").html(diemBaoMat);
                if (diemBaoMatHasYellowColor(diemBaoMat)) 
                    $("#diemBaoMat").addClass("text-white bg-yellow-500");
                else $("#diemBaoMat").removeClass("text-white bg-yellow-500");

                $("#diemBaoMat_ChiSo").html(diemBaoMat_ChiSo);

                $("#soMenhNho_Doc").html(soMenhNho_Doc);
                $("#soMenhNho_Ngang").html(soMenhNho_Ngang);
                $("#soMenhNho_ChiSo").html(soMenhNho_ChiSo);
                if (hasRedColor(soMenhNho_Doc))
                    $("#soMenhNho_Doc").addClass("text-white bg-red-500");
                else $("#soMenhNho_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(soMenhNho_Ngang))
                    $("#soMenhNho_Ngang").addClass("text-white bg-red-500");
                else $("#soMenhNho_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, soMenhNho_ChiSo))
                    $("#soMenhNho_ChiSo").addClass("text-white bg-yellow-500");
                else $("#soMenhNho_ChiSo").removeClass("text-white bg-yellow-500");

                $("#soMenhLon_Doc").html(soMenhLon_Doc);
                $("#soMenhLon_Ngang").html(soMenhLon_Ngang);
                $("#soMenhLon_ChiSo").html(soMenhLon_ChiSo);
                if (hasRedColor(soMenhLon_Doc))
                    $("#soMenhLon_Doc").addClass("text-white bg-red-500");
                else $("#soMenhLon_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(soMenhLon_Ngang))
                    $("#soMenhLon_Ngang").addClass("text-white bg-red-500");
                else $("#soMenhLon_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, soMenhLon_ChiSo))
                    $("#soMenhLon_ChiSo").addClass("text-white bg-yellow-500");
                else $("#soMenhLon_ChiSo").removeClass("text-white bg-yellow-500");

            
                $("#namCaNhan_Doc").html(namCaNhan_Doc);
                $("#namCaNhan_Ngang").html(namCaNhan_Ngang);
                $("#thangCaNhan_Doc").html(thangCaNhan_Doc);
                $("#thangCaNhan_Ngang").html(thangCaNhan_Ngang);
                $("#ngayCaNhan_Doc").html(ngayCaNhan_Doc);
                $("#ngayCaNhan_Ngang").html(ngayCaNhan_Ngang);

                $("#thaiDo_Doc").html(thaiDo_Doc);
                $("#thaiDo_Ngang").html(thaiDo_Ngang);
                $("#thaiDo_ChiSo").html(thaiDo_ChiSo);
                if (hasRedColor(thaiDo_Doc))
                    $("#thaiDo_Doc").addClass("text-white bg-red-500");
                else $("#thaiDo_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(thaiDo_Ngang))
                    $("#thaiDo_Ngang").addClass("text-white bg-red-500");
                else $("#thaiDo_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, thaiDo_ChiSo))
                    $("#thaiDo_ChiSo").addClass("text-white bg-yellow-500");
                else $("#thaiDo_ChiSo").removeClass("text-white bg-yellow-500");

                $("#canBang_Doc").html(
                    canBang_Doc.bieuThuc + " = " + canBang_Doc.ketQua
                );
                $("#canBang_Doc1").html(
                    canBang_Doc.bieuThuc + " = " + canBang_Doc.ketQua
                );
                $("#canBang_Ngang").html(
                    canBang_Ngang.bieuThuc + " = " + canBang_Ngang.ketQua
                );
                $("#canBang_Ngang1").html(
                    canBang_Ngang.bieuThuc + " = " + canBang_Ngang.ketQua
                );
            
                $("#canBang_ChiSo").html(canBang_ChiSo);
                if (hasRedColor(canBang_Doc))
                    $("#canBang_Doc").addClass("text-white bg-red-500");
                else $("#canBang_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(canBang_Ngang))
                    $("#canBang_Ngang").addClass("text-white bg-red-500");
                else $("#canBang_Ngang").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, canBang_ChiSo))
                    $("#canBang_ChiSo").addClass("text-white bg-yellow-500");
                else $("#canBang_ChiSo").removeClass("text-white bg-yellow-500");

                $("#thuThach1").html(thuThach1);
                $("#thuThach2").html(thuThach2);
                $("#thuThach3").html(thuThach3);
                $("#thuThach4").html(thuThach4);

                $("#tuoiDinhCao1").html(namVaTuoiDinhCao1);
                $("#tuoiDinhCao2").html(namVaTuoiDinhCao2);
                $("#tuoiDinhCao3").html(namVaTuoiDinhCao3);
                $("#tuoiDinhCao4").html(namVaTuoiDinhCao4);

                $("#dinh1").html(dinh1_Doc + " - " + dinh1_Ngang);
                $("#dinh2").html(dinh2_Doc + " - " + dinh2_Ngang);
                $("#dinh3").html(dinh3_Doc + " - " + dinh3_Ngang);
                $("#dinh4").html(dinh4_Doc + " - " + dinh4_Ngang);

                $("#namDinhCaoSo4_Thu1").html(dinhCaoSo4_Thu1);
                $("#namDinhCaoSo4_Thu2").html(dinhCaoSo4_Thu2);
                $("#namDinhCaoSo4_Thu3").html(dinhCaoSo4_Thu3);
                $("#namDinhCaoSo4_Thu4").html(dinhCaoSo4_Thu4);

                $("#chuKyVongDoi1").html(baChuKyVongDoi.split("-")[0]);
                $("#chuKyVongDoi2").html(baChuKyVongDoi.split("-")[1]);
                $("#chuKyVongDoi3").html(baChuKyVongDoi.split("-")[2]);

                // check to mau vang neu trung voi chi so bao mat
                /*
                $("#noiTam").html(noiTam);
                if (hasYellowColor(diemBaoMat_ChiSo, noiTam))
                    $("#noiTam").addClass("text-white bg-yellow-500");
                else $("#noiTam").removeClass("text-white bg-yellow-500");
                $("#tuongTac").html(tuongTac);
                if (hasYellowColor(diemBaoMat_ChiSo, tuongTac))
                    $("#tuongTac").addClass("text-white bg-yellow-500");
                else $("#tuongTac").removeClass("text-white bg-yellow-500");
                $("#phatTrien").html(phatTrien);
                if (hasYellowColor(diemBaoMat_ChiSo, phatTrien))
                    $("#phatTrien").addClass("text-white bg-yellow-500");
                else $("#phatTrien").removeClass("text-white bg-yellow-500");
                */

                $("#noiTam_Doc").html(noiTam_Doc);
                $("#noiTam_Ngang").html(noiTam_Ngang);
                $("#noiTam").html(noiTam);
                if (hasRedColor(noiTam_Doc))
                    $("#noiTam_Doc").addClass("text-white bg-red-500");
                else $("#noiTam_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(noiTam_Ngang))
                    $("#noiTam_Ngang").addClass("text-white bg-red-500");
                else $("#noiTam_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(noiTam))
                    $("#noiTam").addClass("text-white bg-red-500");
                else $("#noiTam").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, noiTam))
                    $("#noiTam").addClass("text-white bg-yellow-500");
                else $("#noiTam").removeClass("text-white bg-yellow-500");

                $("#phatTrien_Doc").html(phatTrien_Doc);
                $("#phatTrien_Ngang").html(phatTrien_Ngang);
                $("#phatTrien").html(phatTrien);
                if (hasRedColor(phatTrien_Doc))
                    $("#phatTrien_Doc").addClass("text-white bg-red-500");
                else $("#phatTrien_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(phatTrien_Ngang))
                    $("#phatTrien_Ngang").addClass("text-white bg-red-500");
                else $("#phatTrien_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(phatTrien))
                    $("#phatTrien").addClass("text-white bg-red-500");
                else $("#phatTrien").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, phatTrien))
                    $("#phatTrien").addClass("text-white bg-yellow-500");
                else $("#phatTrien").removeClass("text-white bg-yellow-500");

                $("#tuongTac_Doc").html(tuongTac_Doc);
                $("#tuongTac_Ngang").html(tuongTac_Ngang);
                $("#tuongTac").html(tuongTac);
                if (hasRedColor(tuongTac_Doc))
                    $("#tuongTac_Doc").addClass("text-white bg-red-500");
                else $("#tuongTac_Doc").removeClass("text-white bg-red-500");
                if (hasRedColor(tuongTac_Ngang))
                    $("#tuongTac_Ngang").addClass("text-white bg-red-500");
                else $("#tuongTac_Ngang").removeClass("text-white bg-red-500");
                if (hasRedColor(tuongTac))
                    $("#tuongTac").addClass("text-white bg-red-500");
                else $("#tuongTac").removeClass("text-white bg-red-500");
                if (hasYellowColor(diemBaoMat_ChiSo, tuongTac))
                    $("#tuongTac").addClass("text-white bg-yellow-500");
                else $("#tuongTac").removeClass("text-white bg-yellow-500");

                updateBieuDoNgaySinh(bieuDoNgaySinh);

                var tongHopChiSo = {
                    duong_doi: duongDoi_ChiSo,
                    ket_noi: ketNoi_ChiSo,
                    truong_thanh: truongThanh_ChiSo,
                    nang_luc: inputNgay,
                    tu_duy_hop_ly: tuDuyHopLy_ChiSo,
                    thieu: thieu.split(" - "),
                    phan_hoi_tiem_thuc: phanHoiTiemThuc_Doc,
                    diem_bao_mat: diemBaoMat_ChiSo,
                    linh_hon_lon: linhHonLon_ChiSo,
                    linh_hon_nho: linhHonNho_ChiSo,
                    nhan_cach_lon: nhanCachLon_ChiSo,
                    nhan_cach_nho: nhanCachNho_ChiSo,
                    su_menh_lon: suMenhLon_ChiSo,
                    su_menh_nho: soMenhNho_ChiSo,
                    nam_ca_nhan: getChiSo(namCaNhan_Doc, namCaNhan_Ngang, false),
                    no_nghiep: noNghiep,
                    chu_ky_vong_doi: baChuKyVongDoi.split("-"),
                    dinh_cao: [
                        getChiSo(dinh1_Doc, dinh1_Ngang),
                        getChiSo(dinh2_Doc, dinh2_Ngang),
                        getChiSo(dinh3_Doc, dinh3_Ngang),
                        getChiSo(dinh4_Doc, dinh4_Ngang),
                    ],
                    thu_thach: [
                        thuThach1_Doc,
                        thuThach2_Doc,
                        thuThach3_Doc,
                        thuThach4_Doc,
                    ],
                };
                var pass_tsh = Pass_TSH(tongHopChiSo);
                $("#pass_tsh").html(pass_tsh);

                showNguHanhSumValuesForYears(inputNgay, inputThang, dataMaTrans);
                showNguHanhRawValuesForYears(inputNgay, inputThang, dataMaTrans);
                
                // Trung-HX ADD
                var namVaTuoiDinhCao1KimTuDo = tuoiDinhCao1 + "T <br> " + namDinhCao1;
                var namVaTuoiDinhCao3KimTuDo = (tuoiDinhCao3 + 9) + "T <br> " + (parseInt(namDinhCao3) + 9);
                var itemKimTuDo4TuoiDinhCao = tuoiDinhCao1 + "T";
                var itemKimTuDo5TuoiDinhCao = tuoiDinhCao1 + 9 + "T";
                var itemKimTuDo6TuoiDinhCao = tuoiDinhCao1 + 18 + "T";
                var itemKimTuDo7TuoiDinhCao = tuoiDinhCao1 + 27 + "T";
                setDataToMapKimTuDo(baChuKyVongDoi,
                                inputNam,
                                namVaTuoiDinhCao1KimTuDo, namVaTuoiDinhCao3KimTuDo,
                                dinh1_Doc, dinh2_Doc, dinh3_Doc, dinh4_Doc,
                                dinh1_Ngang, dinh2_Ngang, dinh3_Ngang, dinh4_Ngang,
                                thuThach1_Doc, thuThach2_Doc, thuThach3_Doc, thuThach4_Doc,
                                thuThach1_Ngang, thuThach2_Ngang, thuThach3_Ngang, thuThach4_Ngang,
                                itemKimTuDo4TuoiDinhCao, itemKimTuDo5TuoiDinhCao, itemKimTuDo6TuoiDinhCao, itemKimTuDo7TuoiDinhCao,
                                namCaNhan_Doc, thangCaNhan_Doc, ngayCaNhan_Doc
                                );
            });
        });
			
			
            function validateForm() {
                var hoTen = $("#hoTen").val();
                var tentacy = $("#inputTenThuongGoi").val();
                var inputNgay = parseInt($("#ngay").val());
                var inputThang = parseInt($("#thang").val());
                var inputNam = parseInt($("#nam").val());
               
                $(".text-red-500").empty();

                var nameRegex = /^[a-zA-ZÀ-ỸỳỹỷỵẢẨẤẪẮẬảấầẩẫắậÃẴẲẮẶãẵẳắặÈÉẺẼẸỀẾỆỄỆỂèéẻẽẹềếệễểÌÍỈỊỊỊỊỈÒÓỎÕỌỒỐỔỖỘồốổỗộÙÚỦŨỤỪỨỬỮỰùúủũụừứửữựỳýỷỹỵ ]+$/;

                if (isNaN(inputNgay) || isNaN(inputThang) || isNaN(inputNam)) {
                    $("#error-sinhnhat").text("Ngày, tháng, năm phải là số.");
                } else {
                    if (inputThang < 1 || inputThang > 12) {
                        $("#error-sinhnhat").text("Tháng không hợp lệ.");
                    } else {
                        var daysInMonth = new Date(inputNam, inputThang, 0).getDate();
                        if (inputNgay < 1 || inputNgay > daysInMonth) {
                            $("#error-sinhnhat").text("Ngày không tồn tại.");
                        }
                        if(inputNam < 0){
                            $("#error-sinhnhat").text("Năm không hợp lệ.");
                        }
                    }
                }

                if (tentacy.trim() !== "") {
                    if (!nameRegex.test(tentacy)) {
                        $("#error-tentacy").text("Tên thường gọi phải là ký tự chữ cái.");
                    }
                }

                if (hoTen.trim() !== "") {
                    if (!nameRegex.test(hoTen)) {
                        $("#error-hoTen").text("Họ và tên phải là ký tự chữ cái.");
                    }
                }
              
                var hasErrors = $(".text-danger").text().trim() !== "";
                $("#submitBtn").prop("disabled", hasErrors);
                if (hasErrors) {
                    return false;
                }
                return true;
            }
            const table = {
            1: ["A", "J", "S"],
            2: ["B", "K", "T"],
            3: ["C", "L", "U"],
            4: ["D", "M", "V"],
            5: ["E", "N", "W"],
            6: ["F", "O", "X"],
            7: ["G", "P", "Y"],
            8: ["H", "Q", "Z"],
            9: ["I", "R"],
        };

            const dataMappingPassTSH = {
                duong_doi: [
                    1.2,
                    38.39,
                    74.75,
                    110.111,
                    146.147,
                    182.183,
                    218.219,
                    255.256,
                    292.293,
                    "332.333.334",
                    366.367,
                    399.4,
                ],
                su_menh: [
                    7.8,
                    44.45,
                    80.81,
                    116.117,
                    152.153,
                    188.189,
                    225.226,
                    262.263,
                    "299.300.301",
                    "340.341.342",
                    "374.375.376",
                    "406.407.408",
                ],
                ket_noi: [
                    22.23, 59.6, 95.96, 131.132, 167.168, 203.204, 240.241, 277.278, 315,
                    354, 388, 417,
                ],
                truong_thanh: [
                    24.25, 61.62, 97.98, 133.134, 169.17, 205.206, 242.243, 279.28, 316.317,
                    355.356, 389.39, 418.419,
                ],
                linh_hon: [
                    3.4,
                    40.41,
                    76.77,
                    112.113,
                    148.149,
                    184.185,
                    "220.221.222",
                    "257.258.259",
                    "294.295.296",
                    "335.336.337",
                    "368.369.370.371",
                    "401.402.403",
                ],
                nhan_cach: [
                    5.6, 42.43, 78.79, 114.115, 150.151, 186.187, 223.224, 260.261, 297.298,
                    338.339, 372.373, 404.405,
                ],
                su_menh: [
                    7.8,
                    44.45,
                    80.81,
                    116.117,
                    152.153,
                    188.189,
                    225.226,
                    262.263,
                    "299.300.301",
                    "340.341.342",
                    "374.375.376",
                    "406.407.408",
                ],
                nang_luc: [
                    9.1,
                    46.47,
                    82.83,
                    118.119,
                    154.155,
                    190.191,
                    227.228,
                    264.265,
                    302.303,
                    "343.344.345",
                    "377.378.379",
                    409,
                ],
                tu_duy_hop_ly: [
                    13.14, 50.51, 86.87, 122.123, 158.159, 194.195, 231.232, 268.269,
                    306.307, 348, 349, 350, 382, 383, 384, 412.413,
                ],
                thieu: [
                    26.27,
                    63.64,
                    99.1,
                    135.136,
                    171.172,
                    207.208,
                    244.245,
                    281.282,
                    "318.319.320",
                ],
                phan_hoi_tiem_thuc: [
                    15.16, 52.53, 88.89, 124.125, 160.161, 196.197, 233.234, 270.271,
                    308.309, 351, 385, 414,
                ],
                diem_bao_mat: [
                    17.18, 54.55, 90.91, 126.127, 162.163, 198.199, 235.236, 272.273,
                    310.311, 352.353, 386.387, 415.416,
                ],
                linh_hon: [
                    3.4,
                    40.41,
                    76.77,
                    112.113,
                    148.149,
                    184.185,
                    "220.221.222",
                    "257.258.259",
                    "294.295.296",
                    "335.336.337",
                    "368.369.370.371",
                    "401.402.403",
                ],
                nhan_cach: [
                    5.6, 42.43, 78.79, 114.115, 150.151, 186.187, 223.224, 260.261, 297.298,
                    338.339, 372.373, 404.405,
                ],
                su_menh: [
                    7.8,
                    44.45,
                    80.81,
                    116.117,
                    152.153,
                    188.189,
                    225.226,
                    262.263,
                    "299.300.301",
                    "340.341.342",
                    "374.375.376",
                    "406.407.408",
                ],
                nam_ca_nhan: [
                    35.36, 72.73, 108.109, 144.145, 180.181, 216.217, 253.254, 290.291,
                    327.328, 364.365, 397.398, 426.427,
                ],
                no_nghiep: [
                    "445.446.447.448",
                    "428.429.430.431.432",
                    "433.434.435.436.437",
                    "438.439.440.441.442.443.444",
                ],
                chu_ky_vong_doi: [
                    29.3, 66.67, 102.103, 138.139, 174.175, 210.211, 247.248, 284.285,
                    322.323, 359.36, 392.393,
                ],
                dinh_cao: [
                    31.32, 68.69, 104.105, 140.141, 176.177, 212.213, 249.25, 286.287,
                    324.325, 361.362, 394.395, 423.424,
                ],
                thu_thach: [
                    33.34, 70.71, 106.107, 142.143, 178.179, 214.215, 251.252, 288.289,
                ],
            };

            const masters = [11, 22, 33];
            let noNghiep = [];
            const soToMaus = [13, 14, 16, 19];

            function jdFromDate(dd, mm, yy) {
                var a, y, m, jd;
                a = Math.floor((14 - mm) / 12);
                y = yy + 4800 - a;
                m = mm + 12 * a - 3;
                jd =
                    dd +
                    Math.floor((153 * m + 2) / 5) +
                    365 * y +
                    Math.floor(y / 4) -
                    Math.floor(y / 100) +
                    Math.floor(y / 400) -
                    32045;
                if (jd < 2299161) {
                    jd =
                        dd +
                        Math.floor((153 * m + 2) / 5) +
                        365 * y +
                        Math.floor(y / 4) -
                        32083;
                }
                return jd;
            }

            function jdToDate(jd) {
                var a, b, c, d, e, m, day, month, year;
                if (jd > 2299160) {
                    a = jd + 32044;
                    b = Math.floor((4 * a + 3) / 146097);
                    c = a - Math.floor((b * 146097) / 4);
                } else {
                    b = 0;
                    c = jd + 32082;
                }
                d = Math.floor((4 * c + 3) / 1461);
                e = c - Math.floor((1461 * d) / 4);
                m = Math.floor((5 * e + 2) / 153);
                day = e - Math.floor((153 * m + 2) / 5) + 1;
                month = m + 3 - 12 * Math.floor(m / 10);
                year = b * 100 + d - 4800 + Math.floor(m / 10);
                return [day, month, year];
            }

            function NewMoon(k) {
                var T, T2, T3, dr, Jd1, m, Mpr, F, C1, deltat, JdNew;
                T = k / 1236.85;
                T2 = T * T;
                T3 = T2 * T;
                dr = Math.PI / 180;
                Jd1 =
                    2415020.75933 +
                    29.53058868 * k +
                    0.0001178 * T2 -
                    0.000000155 * T3;
                Jd1 =
                    Jd1 +
                    0.00033 *
                        Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
                m =
                    359.2242 +
                    29.10535608 * k -
                    0.0000333 * T2 -
                    0.00000347 * T3;
                Mpr =
                    306.0253 +
                    385.81691806 * k +
                    0.0107306 * T2 +
                    0.00001236 * T3;
                F =
                    21.2964 +
                    390.67050646 * k -
                    0.0016528 * T2 -
                    0.00000239 * T3;
                C1 =
                    (0.1734 - 0.000393 * T) * Math.sin(m * dr) +
                    0.0021 * Math.sin(2 * dr * m);
                C1 =
                    C1 -
                    0.4068 * Math.sin(Mpr * dr) +
                    0.0161 * Math.sin(dr * 2 * Mpr);
                C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
                C1 =
                    C1 +
                    0.0104 * Math.sin(dr * 2 * F) -
                    0.0051 * Math.sin(dr * (m + Mpr));
                C1 =
                    C1 -
                    0.0074 * Math.sin(dr * (m - Mpr)) +
                    0.0004 * Math.sin(dr * (2 * F + m));
                C1 =
                    C1 -
                    0.0004 * Math.sin(dr * (2 * F - m)) -
                    0.0006 * Math.sin(dr * (2 * F + Mpr));
                C1 =
                    C1 +
                    0.001 * Math.sin(dr * (2 * F - Mpr)) +
                    0.0005 * Math.sin(dr * (2 * Mpr + m));
                if (T < -11) {
                    deltat =
                        0.001 +
                        0.000839 * T +
                        0.0002261 * T2 -
                        0.00000845 * T3 -
                        0.000000081 * T * T3;
                } else {
                    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
                }
                JdNew = Jd1 + C1 - deltat;
                return JdNew;
            }

            function SunLongitude(jdn) {
                var T, T2, dr, m, L0, DL, L;
                T = (jdn - 2451545) / 36525;
                T2 = T * T;
                dr = Math.PI / 180;
                m =
                    357.5291 +
                    35999.0503 * T -
                    0.0001559 * T2 -
                    0.00000048 * T * T2;
                L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
                DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * m);
                DL =
                    DL +
                    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * m) +
                    0.00029 * Math.sin(dr * 3 * m);
                L = L0 + DL;
                L = L * dr;
                L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2)); // Normalize to (0, 2*PI)
                return L;
            }

            function getSunLongitude(dayNumber, timeZone) {
                return Math.floor(
                    (SunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) *
                        6
                );
            }

            function getNewMoonDay(k, timeZone) {
                return Math.floor(NewMoon(k) + 0.5 + timeZone / 24);
            }

            function getLunarMonth11(yy, timeZone) {
                var k, off, nm, sunLong;
                off = jdFromDate(31, 12, yy) - 2415021;
                k = Math.floor(off / 29.530588853);
                nm = getNewMoonDay(k, timeZone);
                sunLong = getSunLongitude(nm, timeZone);
                if (sunLong >= 9) {
                    nm = getNewMoonDay(k - 1, timeZone);
                }
                return nm;
            }

            function getLeapMonthOffset(a11, timeZone) {
                var k, last, Arc, I;
                k = Math.floor((a11 - 2415021.07699869) / 29.530588853 + 0.5);
                last = 0;
                I = 1;
                Arc = getSunLongitude(getNewMoonDay(k + I, timeZone), timeZone);
                while (Arc !== last && I < 14) {
                    last = Arc;
                    I++;
                    Arc = getSunLongitude(
                        getNewMoonDay(k + I, timeZone),
                        timeZone
                    );
                }
                return I - 1;
            }

            function amsangduong(
                lunarDay,
                lunarMonth,
                lunarYear,
                lunarLeap,
                timeZone
            ) {
                var k, a11, b11, off, leapOff, LeapMonth, monthStart, R;
                if (!lunarYear) lunarYear = new Date().getFullYear();
                if (lunarMonth < 11) {
                    a11 = getLunarMonth11(lunarYear - 1, timeZone);
                    b11 = getLunarMonth11(lunarYear, timeZone);
                } else {
                    a11 = getLunarMonth11(lunarYear, timeZone);
                    b11 = getLunarMonth11(lunarYear + 1, timeZone);
                }
                k = Math.floor(0.5 + (a11 - 2415021.07699869) / 29.530588853);
                off = lunarMonth - 11;
                if (off < 0) off = off + 12;
                if (b11 - a11 > 365) {
                    leapOff = getLeapMonthOffset(a11, timeZone);
                    LeapMonth = leapOff - 2;
                    if (LeapMonth < 0) LeapMonth = LeapMonth + 12;
                    if (lunarLeap !== 0 && lunarMonth !== LeapMonth) {
                        return null;
                    } else if (lunarLeap !== 0 || off >= leapOff) {
                        off = off + 1;
                    }
                }
                monthStart = getNewMoonDay(k + off, timeZone);
                R = jdToDate(monthStart + lunarDay - 1);
                return new Date(R[2], R[1] - 1, R[0]);
            }
            
            const transferNameToNumberSoulPlan = (name) => {
                let result = [];
                const arrName = name.trim().replace(/ /g, "").toUpperCase().split("");
                for (var i = 0; i < arrName.length; i++) {
                    switch (arrName[i]) {
                        case "A": {
                            if (i < arrName.length - 2 && arrName[i + 1] == "H") {
                                result.push(5);
                                i++;
                            } else {
                                result.push(1);
                            }
                            break;
                        }
                        case "B":
                            result.push(2);
                            break;
                        case "C": {
                            if (i < arrName.length - 2 && arrName[i + 1] == "H") {
                                result.push(8);
                                i++;
                            } else result.push(11);
                            break;
                        }
                        case "D":
                            result.push(4);
                            break;
                        case "E":
                        case "H":
                            result.push(5);
                            break;
                        case "F":
                            result.push(17);
                            break;
                        case "P": {
                            if (i == arrName.length - 1) {
                                result.push(12);
                                i++;
                            } else {
                                result.push(17);
                            }
                            break;
                        }
                        case "G":
                            result.push(3);
                            break;
                        case "I":
                        case "J":
                            result.push(10);
                            break;
                        case "K":
                        case "Q":
                            result.push(19);
                            break;
                        case "L":
                            result.push(12);
                            break;
                        case "M": {
                            if (i == arrName.length - 1) {
                                result.push(12);
                                i++;
                            } else result.push(13);
                            break;
                        }
                        case "N":
                            result.push(14);
                            break;
                        case "O":
                        case "U":
                        case "V":
                            result.push(6);
                            break;
                        case "R":
                            result.push(20);
                            break;
                        case "S":
                        case "X":
                            result.push(15);
                            break;
                        case "T": {
                            if (i < arrName.length - 1) {
                               if (arrName[i + 1] == "A" || arrName[i + 1] == "H") {
                                    result.push(22);
                                    i++;
                                } else if (arrName[i + 1] == "Z") {
                                    result.push(18);
                                    i++;
                                } else {
                                    result.push(9);
                                }
                            } else {
                                result.push(9);
                            }
                            break;
                        }
                        case "Y":
                            result.push(16);
                            break;
                        case "Z":
                            result.push(7);
                            break;
                        case "W": {
                            if (i < arrName.length - 1 && arrName[i + 1] == "H") {
                                result.push(16);
                                i++;
                            } else result.push(6);
                            break;
                        }
                    }
                }
                return result;
            };

            const transferDayToNumber = (ngay, isDay) => {
                if (((ngay == 11 || ngay == 22) && isDay) || ngay < 10) return ngay;
                let result = 0;
                if (isNaN(ngay)) {
                    console.error("Giá trị đầu vào không phải là số");
                    return 0;
                }
                while (ngay !== 0) {
                    result += ngay % 10;
                    ngay = Math.floor(ngay / 10);
                }
                return +result;
            };

            const transferNameToUnMarked = (name) => {
                return name
                    .trim()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/Đ/g, "D")
                .replace(/đ/g, "d")
                .replace(/Â/g, "A")
                .replace(/â/g, "a")
                .replace(/Ă/g, "A")
                .replace(/ă/g, "a")
                .replace(/Á/g, "A")
                .replace(/á/g, "a")
                .replace(/À/g, "A")
                .replace(/à/g, "a")
                .replace(/Ả/g, "A")
                .replace(/ả/g, "a")
                .replace(/Ã/g, "A")
                .replace(/ã/g, "a")
                .replace(/Ạ/g, "A")
                .replace(/ạ/g, "a")
                .replace(/Ê/g, "E")
                .replace(/ê/g, "e")
                .replace(/É/g, "E")
                .replace(/é/g, "e")
                .replace(/È/g, "E")
                .replace(/è/g, "e")
                .replace(/Ẻ/g, "E")
                .replace(/ẻ/g, "e")
                .replace(/Ẽ/g, "E")
                .replace(/ẽ/g, "e")
                .replace(/Ẹ/g, "E")
                .replace(/ẹ/g, "e")
                .replace(/Ô/g, "O")
                .replace(/ô/g, "o")
                .replace(/Ơ/g, "O")
                .replace(/ơ/g, "o")
                .replace(/Ó/g, "O")
                .replace(/ó/g, "o")
                .replace(/Ò/g, "O")
                .replace(/ò/g, "o")
                .replace(/Ỏ/g, "O")
                .replace(/ỏ/g, "o")
                .replace(/Õ/g, "O")
                .replace(/õ/g, "o")
                .replace(/Ọ/g, "O")
                .replace(/ọ/g, "o")
                .replace(/Ư/g, "U")
                .replace(/ư/g, "u")
                .replace(/Ú/g, "U")
                .replace(/ú/g, "u")
                .replace(/Ù/g, "U")
                .replace(/ù/g, "u")
                .replace(/Ủ/g, "U")
                .replace(/ủ/g, "u")
                .replace(/Ũ/g, "U")
                .replace(/ũ/g, "u")
                .replace(/Ụ/g, "U")
                .replace(/ụ/g, "u")
                .replace(/Ý/g, "Y")
                .replace(/ý/g, "y")
                .replace(/Ỳ/g, "Y")
                .replace(/ỳ/g, "y")
                .replace(/Ỷ/g, "Y")
                .replace(/ỷ/g, "y")
                .replace(/Ỹ/g, "Y")
                .replace(/ỹ/g, "y")
                .replace(/Ỵ/g, "Y")
                .replace(/ỵ/g, "y");
            };
            
            const isMasterNumber = (number) => {
                return +number == 11 || number == 22 || number == 33;
            };

            const transferHaiChuSoThanhMotChuSo = (
                number,
                hasMaster = false,
                isSoDon = false
            ) => {
                if (hasMaster && masters.includes(+number)) {
                    return number;
                }
                let result = number.toString();
                let temp = result;
                while (temp >= 10) {
                    if(isMasterNumber(temp) && hasMaster) {
                        return temp;
                    }
                    temp = transferDayToNumber(temp, false);
                    result += "/" + temp;
                }

                return isSoDon
                    ? result.toString().split("/").pop()
                    : result;
            };

            const rutGonNamSinh = (inputNam) => {
                if(inputNam < 10) return inputNam;
                let total = 0;
                let rutGon = "";
                let temp;
                let revert = true;

                inputNam.toString().split("").forEach((e, index) => {
                    total += +e;
                });
                if(total < 10) return total;
          

                temp = total;

                while (temp >= 10) {
                    temp = transferDayToNumber(temp, false);
                    if(revert) rutGon = temp + "/" + rutGon;
                    else
                        rutGon += "/" + temp;
                }
                if(revert) return rutGon + total;
                rutGon = rutGon.replace("/", "");
                return total + "/" + rutGon
            };

            const transferNgayThangToFormat = (date) => {
                if (+date < 10) return date;
                const temp = transferDayToNumber(date, false);
                return date = transferNgayThangToFormat(temp) +  "/" + date;
            };
            
            const BaChuKyVongDoi = (inputNgay, inputThang, inputNam)=> {
                return (
                    transferNgayThangToFormat(inputThang) +
                    "-" +
                    transferNgayThangToFormat(inputNgay) +
                    "-" +
                    rutGonNamSinh(+inputNam)
                );
            };

            const getValueInSet = (set, getMaster = false, getFirst = true, getLast = false) => {
                const arr = set.toString().split("/");
                if(getMaster) {
                    for(let i = 0; i < arr.length; i++) {
                     if(isMasterNumber(+arr[i])) {
                        return arr[i];
                        }
                    }
                }
                if(getFirst) {
                    return arr[0];
                }
                if(getLast) {
                    return arr[arr.length - 1];
                }
            }

            const BonDinhGiaiDoanCuocDoi_Doc = (inputNgay, inputThang, inputNam) => {
                var ngaySinhRutGon = transferNgayThangToFormat(inputNgay);
                var thangSinhRutGon = transferNgayThangToFormat(inputThang);
                var namSinhRutGon = rutGonNamSinh(inputNam);
                
                var ngaySinhDon = getValueInSet(ngaySinhRutGon, true, true, false);
                var thangSinhDon = getValueInSet(thangSinhRutGon, true, true, false); 
                var namSinhDon = getValueInSet(namSinhRutGon, true, true, false); 
                
                let dinhMot = transferNgayThangToFormat(+thangSinhDon + +ngaySinhDon);

                let dinhHai = transferNgayThangToFormat(+ngaySinhDon + +namSinhDon);

                var tempDinhMot = getValueInSet(dinhMot, true, true, false);
                var tempDinhHai = getValueInSet(dinhHai, true, true, false);

                const dinhBa = transferNgayThangToFormat(+tempDinhHai + +tempDinhMot);

                const dinhBon = transferNgayThangToFormat(+thangSinhDon + +namSinhDon);

                
                return [dinhMot, dinhHai, dinhBa, dinhBon].join("-");
            };

            const showData = () => {
                $("#bangThanSo").removeClass("hidden");
                hideLoadingPopup();
                const scrollToEl = $('#bangThanSo');
                $('html').animate(
                    {
                    scrollTop: scrollToEl.offset().top - 35,
                    },
                    2000 //speed
                );
            };

            const getCurrentDate = () => {
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, "0");
                var mm = String(today.getMonth() + 1).padStart(2, "0");
                var yyyy = today.getFullYear();
                return dd + "/" + mm + "/" + yyyy;
            };

            const getChiSo = (doc = "", ngang = "") => {
                doc += "";
                ngang += "";
                let result = 0;
                if (!doc) return ngang;
                if (!ngang) return doc;
                    result = doc.split("/")[doc.split("/").length - 1]
                return result;
            };

            const hasRedColor = (data) => {
                const arr = data.toString().split("/");
                for (const t of arr) {
                    if (soToMaus.includes(+t)) {
                        let soDon = transferHaiChuSoThanhMotChuSo(+t, false, true);
                        if (!noNghiep.includes(soDon.toString())) {
                            noNghiep.push(soDon);
                        }
                        return true;
                    }
                }
                return false;
            };

            const hasYellowColor = (diemBaoMat, data) => {
                const arr = data.toString().split("/");
                for (const t of arr) {
                    if (diemBaoMat == t) {
                        return true;
                    }
                }
                return false;
            };

            const BieuDoNgaySinh = (
                content,
                data = {
                    1: [],
                    2: [],
                    3: [],
                    4: [],
                    5: [],
                    6: [],
                    7: [],
                    8: [],
                    9: [],
                }
            ) => {
                let result = data;
                let arrDate = content.split("");
                for (let i = 1; i <= 9; i++) {
                    arrDate = arrDate.filter((e) => {
                        if (e == "/") return false;
                        if (e == i) {
                            if (result[i]) {
                                result[i].push(e);
                            } else {
                                result[i] = [e];
                            }
                            return false;
                        }
                        return true;
                    });
                }

                return result;
            };

            const updateBieuDoNgaySinh_ThuongGoi = (bieuDoNgaySinh) => {
                for (let i = 1; i <= 9; i++) {
                    var show = bieuDoNgaySinh[i] ? bieuDoNgaySinh[i].join("") : "";
                    if(bieuDoNgaySinh[i].length > 12) {
                        show = i + "^" + "<span class='text-[11px] font-semibold text-red-600'> " + bieuDoNgaySinh[i].length + "</span>";
                    }
                    $(`#bieuDoNgaySinh_ThuongGoi_cell_${i}`).html(show);
                }
            };

            const updateBieuDoNgaySinh_DayDu = (bieuDoNgaySinh) => {
                for (let i = 1; i <= 9; i++) {
                    var show = bieuDoNgaySinh[i] ? bieuDoNgaySinh[i].join("") : "";
                    if(bieuDoNgaySinh[i].length > 12) {
                        show = i + "^" + "<span class='text-[11px] font-semibold text-red-600'> " + bieuDoNgaySinh[i].length + "</span>";
                    }
                    $(`#bieuDoNgaySinh_DayDu_cell_${i}`).html(
                        show
                    );
                }
            };

            const updateBieuDoNgaySinh = (bieuDoNgaySinh) => {
                for (let i = 1; i <= 9; i++) {
                    var show = bieuDoNgaySinh[i] ? bieuDoNgaySinh[i].join("") : "";
                    if(bieuDoNgaySinh[i].length > 12) {
                        show = i + "^" + "<span class='text-[11px] font-semibold text-red-600'> " + bieuDoNgaySinh[i].length + "</span>";
                    }
                    $(`#bieuDoNgaySinh_cell_${i}`).html(
                        show
                    );
                }
            };

            const MaTranTamLy = (ngay, thang, nam) => {
                ngay = ngay.toString(); thang = thang.toString(); nam = nam.toString();
                const duLieu1 = +ngay.split("").reduce((total, e) => total + +e, 0) + +thang.split("").reduce((total, e) => total + +e, 0) + +nam.split("").reduce((total, e) => total + +e, 0);
             
                const duLieu2 = transferDayToNumber(duLieu1, false);
                const soDauTienCuaNgay = ngay.toString().split('')[0];
                const duLieu3 = +duLieu1 - soDauTienCuaNgay * 2;
                const duLieu4 = transferDayToNumber(duLieu3, false);
                const tongHopDuLieu = ngay + "/" + thang + "/" + nam + '/' +  duLieu1 + "/" + duLieu2 + "/" + duLieu3 + "/" + duLieu4;
                return BieuDoNgaySinh(tongHopDuLieu);
            };

            const updateGiaoDienChiSo = (tenChiSo, listChiSo, chiSoMax, chiSoMin) => {
                for (var i = 0; i < listChiSo.length; i++) {
                    if(listChiSo[i] == chiSoMax) {
                        $(`#${tenChiSo}${i + 1}`).html(listChiSo[i] + " <br> " +  " <span class= 'uppercase text-[10px]'></span>");
                    }
                    else if(listChiSo[i] == chiSoMin) {
                        $(`#${tenChiSo}${i + 1}`).html(listChiSo[i] + " <br> " +  " <span class= 'uppercase text-[10px]'></span>");
                    }
                    else if (listChiSo[i] / chiSoMax >= 0.7) {
                        $(`#${tenChiSo}${i + 1}`).html(listChiSo[i] + " <br>  <span class='uppercase text-[10px]'><span>");
                       
                    }
                    else if (listChiSo[i] / chiSoMax >= 0.4) {
                        $(`#${tenChiSo}${i + 1}`).html(listChiSo[i] + " <br> " + " <span class= 'uppercase text-[10px]'></span>");
                    }
                    else {
                        $(`#${tenChiSo}${i + 1}`).html(listChiSo[i] + " <br> " + "<span class= 'uppercase text-[10px]'></span>");
                    }
                }
            }

            const getNguHanhFromMaTran = (maTranTamLy, getNumber = false) => {
                var kim, moc, thuy, hoa, tho;
                if(getNumber) {
                    hoa =
                    maTranTamLy[3].join("") + " " +
                    maTranTamLy[5].join("") + " " +
                    maTranTamLy[6].join("") + " " +
                    maTranTamLy[7].join("") + " " +
                    maTranTamLy[8].join("") + " " +
                    maTranTamLy[9].join("");
                    tho =
                    maTranTamLy[4].join("") + " " + 
                    maTranTamLy[5].join("") + " " +  
                    maTranTamLy[6].join("");
                    kim =
                    maTranTamLy[1].join("") + " " + 
                    maTranTamLy[2].join("") + " " + 
                    maTranTamLy[3].join("") + " " + 
                    maTranTamLy[5].join("") + " " + 
                    maTranTamLy[6].join("") + " " + 
                    maTranTamLy[9].join("");
                    moc =
                    maTranTamLy[1].join("") + " " + 
                    maTranTamLy[4].join("") + " " + 
                    maTranTamLy[5].join("") + " " +
                    maTranTamLy[7].join("") + " " + 
                    maTranTamLy[8].join("") + " " + 
                    maTranTamLy[9].join(""); 
                    thuy =
                    maTranTamLy[1].join("") + " " + 
                    maTranTamLy[2].join("") + " " + 
                    maTranTamLy[3].join("") + " " + 
                    maTranTamLy[4].join("") + " " + 
                    maTranTamLy[5].join("") + " " + 
                    maTranTamLy[7].join("");
                 }
                 else {
                    hoa =
                    maTranTamLy[3].length +
                    maTranTamLy[5].length +
                    maTranTamLy[6].length +
                    maTranTamLy[7].length +
                    maTranTamLy[8].length +
                    maTranTamLy[9].length;
                    tho =
                    maTranTamLy[4].length + maTranTamLy[5].length + maTranTamLy[6].length;
                    kim =
                    maTranTamLy[1].length +
                    maTranTamLy[2].length +
                    maTranTamLy[3].length +
                    maTranTamLy[5].length +
                    maTranTamLy[6].length +
                    maTranTamLy[9].length;
                    moc =
                    maTranTamLy[1].length +
                    maTranTamLy[4].length +
                    maTranTamLy[7].length +
                    maTranTamLy[8].length +
                    maTranTamLy[9].length +
                    maTranTamLy[5].length;
                    thuy =
                    maTranTamLy[1].length +
                    maTranTamLy[2].length +
                    maTranTamLy[3].length +
                    maTranTamLy[4].length +
                    maTranTamLy[5].length +
                    maTranTamLy[7].length;
                }
                    return [kim, moc, thuy, hoa, tho];
            }

            const updateMaTranTamLyAndTamLyTinhNam_Nu = (maTranTamLy) => {
                const dataNguHanh = getNguHanhFromMaTran(maTranTamLy);

                const nguHanh1 = {
                    color: "text-red-500", 
                    showName: "Hỏa",
                    typeData: "hoa",
                    value: dataNguHanh[3],
                };

                const nguHanh2 = {
                    color: "text-blue-500",
                    showName: "Thủy",
                    typeData: "thuy",
                    value: dataNguHanh[2],
                };
                const nguHanh3 = {
                    color: "text-green-500",
                    showName: "Mộc",
                    typeData: "moc",
                    value: dataNguHanh[1],
                };
                const nguHanh4 = {
                    color: "text-yellow-500",
                    showName: "Kim",
                    typeData: "kim",
                    value: dataNguHanh[0],
                };

                const nguHanh5 = {
                    color: "text-gray-500",
                    showName: "Thổ",
                    typeData: "tho",
                    value: dataNguHanh[4],
                };

                const chiSoDong1 =
                    maTranTamLy[3].length + maTranTamLy[6].length + maTranTamLy[9].length;
                const chiSoDong2 =
                    maTranTamLy[2].length + maTranTamLy[5].length + maTranTamLy[8].length;
                const chiSoDong3 =
                    maTranTamLy[1].length + maTranTamLy[4].length + maTranTamLy[7].length;
                const chiSoDong4 =
                    maTranTamLy[1].length + maTranTamLy[5].length + maTranTamLy[9].length;
                const chiSoDong = [chiSoDong1, chiSoDong2, chiSoDong3, chiSoDong4];

                const chiSoCot1 =
                    maTranTamLy[1].length + maTranTamLy[2].length + maTranTamLy[3].length;
                const chiSoCot2 =
                    maTranTamLy[4].length + maTranTamLy[5].length + maTranTamLy[6].length;
                const chiSoCot3 =
                    maTranTamLy[7].length + maTranTamLy[8].length + maTranTamLy[9].length;
                const chiSoCot4 =
                maTranTamLy[3].length + maTranTamLy[5].length + maTranTamLy[7].length;
                const chiSoCot = [chiSoCot1, chiSoCot2, chiSoCot3, chiSoCot4];

                const listChiSo = chiSoDong.concat(chiSoCot);
                let chiSoMax = 0, chiSoMin = listChiSo[0];
                for (let i = 0; i < listChiSo.length; i++) {
                    if (listChiSo[i] && listChiSo[i] > chiSoMax) {
                        chiSoMax = listChiSo[i];
                    }
                    if(listChiSo[i] <= chiSoMin) {
                        chiSoMin = listChiSo[i];
                    }
                }

               updateGiaoDienChiSo("chiSoDong", chiSoDong, chiSoMax, chiSoMin);
               updateGiaoDienChiSo("chiSoCot", chiSoCot, chiSoMax, chiSoMin);
               
                let listNguHanh = [nguHanh1, nguHanh2, nguHanh3, nguHanh4, nguHanh5];
                listNguHanh.sort((a, b) => b.value - a.value);

                for (var i = 0; i < listNguHanh.length; i++) {
                    $(`#nguHanh${i + 1}`).html(
                        ` <p class='${listNguHanh[i].color}'> ${listNguHanh[i].showName} </p>`
                        + `<p data-type='${listNguHanh[i].typeData}' class='maTranTamLy-nguHanh onClickShowPopupByVal ${listNguHanh[i].color}'>${listNguHanh[i].value}</p>`
                    );
                }

                for (let i = 1; i <= 9; i++) {
                    $(`#maTranTamLy_cell_${i}`).html(
                        maTranTamLy[i] ? maTranTamLy[i].join("") : ""
                    );
                }

                // ma tran tam ly tinh ban chat - chuong ngai
                var bc_chan = 0, bc_le = 0;
                var cn_chan = 0, cn_le = 0; 
                for( var i = 1; i <= 9; i++) {
                    if(maTranTamLy[i].length == 0) {
                        bc_le++;
                    }
                    else if(maTranTamLy[i].length % 2 == 0) {
                        bc_chan++;
                        cn_chan++;
                    }
                    else {
                        bc_le++;
                        cn_le++;
                    }
                }
               
                $("#tamLyTinhBanChat").html(bc_le + "L - " + bc_chan + "C");
                $("#tamLyTinhChuongNgai").html(cn_le + "L - " + cn_chan + "C");
            };

            const isShortName = (name) => {
                name = name.trim().replace(/ /g, "");
                let result = 0;
                const arrName = name.trim().replace(/ /g, "").toUpperCase().split("");
                for (var i = 0; i < arrName.length; i++) {
                    if(arrName[i] == "A" && arrName[i + 1] == "H" || arrName[i] == "C" && arrName[i + 1] == "H" || arrName[i] == "S" && arrName[i + 1] == "H" || arrName[i] == "T" && arrName[i + 1] == "A" || arrName[i] == "T" && arrName[i + 1] == "H" || arrName[i] == "T" && arrName[i + 1] == "Z" || arrName[i] == "W" && arrName[i + 1] == "H") {
                        result++;
                        i++;
                        continue;
                    }
                    result++;
                }
                return result < 10;
            };

            const soulPlan_Process_UpdateUI = (name) => {
                const isShort = isShortName(name);
                if (isShort) {
                    $("#tamGiac2").addClass("hidden");
                }
                const listNumbers = transferNameToNumberSoulPlan(name);
                let vatChatThuThach = 0;
                let tinhThanThuThach = 0;
                let vatChatTaiNang = 0;
                let tinhThanTaiNang = 0;
                let vatChatMucTieu = 0;
                let tinhThanMucTieu = 0;

                let vatChatThuThach1 = 0;
                let tinhThanThuThach1 = 0;
                let vatChatTaiNang1 = 0;
                let tinhThanTaiNang1 = 0;
                let vatChatMucTieu1 = 0;
                let tinhThanMucTieu1 = 0;

                let vatChatThuThach2 = 0;
                let tinhThanThuThach2 = 0;
                let vatChatTaiNang2 = 0;
                let tinhThanTaiNang2 = 0;
                let vatChatMucTieu2 = 0;
                let tinhThanMucTieu2 = 0;
                let index = 0;
                if (isShort) {
                    for (var i of listNumbers) {
                        if (index == 0) {
                            tinhThanThuThach += i;
                        }
                        if (index == 1) {

                            tinhThanTaiNang += i;
                        }
                        if (index == 2) {
                            tinhThanMucTieu += i;
                        }

                        index++;
                        index = index % 3;
                    }
                } else {
                    for (var i of listNumbers) {
                        if (index == 0) {

                            vatChatThuThach += i;
                        }
                        if (index == 1) {
                            tinhThanThuThach += i;
                        }
                        if (index == 2) {
                            vatChatTaiNang += i;
                        }
                        if (index == 3) {
                            tinhThanTaiNang += i;
                        }
                        if (index == 4) {
                            vatChatMucTieu += i;
                        }
                        if (index == 5) {
                            tinhThanMucTieu += i;
                        }
                        index++;
                        index = index % 6;
                    }
                }
                tinhThanTaiNang > 22
                    ? (tinhThanTaiNang1 = transferDayToNumber(tinhThanTaiNang))
                    : (tinhThanTaiNang1 = tinhThanTaiNang);
                tinhThanMucTieu > 22
                    ? (tinhThanMucTieu1 = transferDayToNumber(tinhThanMucTieu))
                    : (tinhThanMucTieu1 = tinhThanMucTieu);
                tinhThanThuThach > 22
                    ? (tinhThanThuThach1 = transferDayToNumber(tinhThanThuThach))
                    : (tinhThanThuThach1 = tinhThanThuThach);

                if (!isShort) {
                    vatChatThuThach > 22
                        ? (vatChatThuThach1 = transferDayToNumber(vatChatThuThach))
                        : (vatChatThuThach1 = vatChatThuThach);
                    vatChatTaiNang > 22
                        ? (vatChatTaiNang1 = transferDayToNumber(vatChatTaiNang))
                        : (vatChatTaiNang1 = vatChatTaiNang);
                    vatChatMucTieu > 22
                        ? (vatChatMucTieu1 = transferDayToNumber(vatChatMucTieu))
                        : (vatChatMucTieu1 = vatChatMucTieu);
                }

                tinhThanThuThach >= 10
                    ? (tinhThanThuThach2 = transferHaiChuSoThanhMotChuSo(
                        tinhThanThuThach1,
                        false,
                        true
                    ))
                    : (tinhThanThuThach2 = tinhThanThuThach1);
                tinhThanTaiNang >= 10
                    ? (tinhThanTaiNang2 = transferHaiChuSoThanhMotChuSo(
                        tinhThanTaiNang1,
                        false,
                        true
                    ))
                    : (tinhThanTaiNang2 = tinhThanTaiNang1);
                tinhThanMucTieu >= 10
                    ? (tinhThanMucTieu2 = transferHaiChuSoThanhMotChuSo(
                        tinhThanMucTieu1,
                        false,
                        true
                    ))
                    : (tinhThanMucTieu2 = tinhThanMucTieu1);

                if (!isShort) {
                    vatChatThuThach >= 10
                        ? (vatChatThuThach2 = transferHaiChuSoThanhMotChuSo(
                            vatChatThuThach1,
                            false,
                            true
                        ))
                        : (vatChatThuThach2 = vatChatThuThach1);
                    vatChatTaiNang >= 10
                        ? (vatChatTaiNang2 = transferHaiChuSoThanhMotChuSo(
                            vatChatTaiNang1,
                            false,
                            true
                        ))
                        : (vatChatTaiNang2 = vatChatTaiNang1);
                    vatChatMucTieu >= 10
                        ? (vatChatMucTieu2 = transferHaiChuSoThanhMotChuSo(
                            vatChatMucTieu1,
                            false,
                            true
                        ))
                        : (vatChatMucTieu2 = vatChatMucTieu1);
                }

                let vanMenhLinhHon1, vanMenhLinhHon2;

                if (isShort) {
                    vanMenhLinhHon1 = transferDayToNumber(
                        tinhThanMucTieu1 + tinhThanThuThach1 + tinhThanTaiNang1
                    );
                    vanMenhLinhHon2 = transferHaiChuSoThanhMotChuSo(
                        tinhThanMucTieu2 + tinhThanThuThach2 + tinhThanTaiNang2,
                        false,
                        true
                    );
                } else {
                    vanMenhLinhHon1 = transferDayToNumber(
                        vatChatThuThach1 +
                            tinhThanThuThach1 +
                            vatChatTaiNang1 +
                            tinhThanTaiNang1 +
                            vatChatMucTieu1 +
                            tinhThanMucTieu1
                    );
                    vanMenhLinhHon2 = transferHaiChuSoThanhMotChuSo(
                        vatChatThuThach2 +
                            tinhThanThuThach2 +
                            vatChatTaiNang2 +
                            tinhThanTaiNang2 +
                            vatChatMucTieu2 +
                            tinhThanMucTieu2,
                        false,
                        true
                    );
                }

                //update UI
                $("#vanMenhLinhHon").html(vanMenhLinhHon1 + " - " + vanMenhLinhHon2);
                $("#tinhThanMucTieu").html(tinhThanMucTieu1 + " - " + tinhThanMucTieu2);
                $("#tinhThanTaiNang").html(tinhThanTaiNang1 + " - " + tinhThanTaiNang2);
                $("#tinhThanThuThach").html(tinhThanThuThach1 + " - " + tinhThanThuThach2);
                if (!isShort) {
                    $("#tamGiac2").removeClass("hidden");
                    $("#vatChatThuThach").removeClass("hidden");
                    $("#vatChatMucTieu").removeClass("hidden");
                    $("#vatChatTaiNang").removeClass("hidden");
                    $("#soulPlan_MucTieu2").removeClass("hidden");
                    $("#soulPlan_ThuThach2").removeClass("hidden");
                    $("#soulPlan_TaiNang2").removeClass("hidden");
                    $("#soulPlan_MucTieu1").html("Tinh Thần<br />Mục Tiêu");
                    $("#soulPlan_ThuThach1").html("Tinh Thần<br />Thử Thách");
                    $("#soulPlan_TaiNang1").html("Tinh Thần<br />Tài Năng");
                    $("#vatChatThuThach").html(vatChatThuThach1 + " - " + vatChatThuThach2);
                    $("#vatChatMucTieu").html(vatChatMucTieu1 + " - " + vatChatMucTieu2);
                    $("#vatChatTaiNang").html(vatChatTaiNang1 + " - " + vatChatTaiNang2);
                    $(`#divVanMenhLinhHon`).removeClass("hidden");
                } else {
                    $("#soulPlan_MucTieu1").html("Tinh Thần/Vật Chất<br />Mục Tiêu");
                    $("#soulPlan_ThuThach1").html("Tinh Thần/Vật Chất<br />Thử Thách");
                    $("#soulPlan_TaiNang1").html("Tinh Thần/Vật Chất<br />Tài Năng");
                    $("#soulPlan_MucTieu2").addClass("hidden");
                    $("#soulPlan_ThuThach2").addClass("hidden");
                    $("#soulPlan_TaiNang2").addClass("hidden");
                    $("#vatChatThuThach").addClass("hidden");
                    $("#vatChatMucTieu").addClass("hidden");
                    $("#vatChatTaiNang").addClass("hidden");
                    $(`#divVanMenhLinhHon`).addClass("hidden");
                }
            };

            const transferDataToIndexPassTSH = (name, data) => {
                if (name == "no_nghiep") {
                    if (data == 7) return data - 4;
                    else if (data >= 4) return data - 3;
                }
                if (data == 11) {
                    return 9;
                } else if (data == 22) {
                    return 10;
                } else if (data == 33) {
                    return 11;
                }
                return data - 1;
            };

            const getMappingDataFromPassTSH = (name, value) => {
                let index;
                if (value == 0) return "";
                if (name == "su_menh_lon" || name == "su_menh_nho") name = "su_menh";
                if (name == "linh_hon_lon" || name == "linh_hon_nho") name = "linh_hon";
                if (name == "nhan_cach_lon" || name == "nhan_cach_nho") name = "nhan_cach";
                if (
                    name == "thieu" ||
                    name == "no_nghiep" ||
                    name == "chu_ky_vong_doi" ||
                    name == "dinh_cao" ||
                    name == "thu_thach"
                ) {
                    let result = [];
                    for (let v of value) {
                        if (v == 0 || (name == "thu_thach" && v == 9)) continue;
                        if (v.toString().includes("/") && name == "chu_ky_vong_doi") {
                            v = v.split("/")[0];
                        }

                        index = transferDataToIndexPassTSH(name, v);
                        var temp = dataMappingPassTSH[name][index];
                        if(result.includes(temp)) continue;
                        result.push(dataMappingPassTSH[name][index]);
                    }
                    return result.join(", ");
                }
                index = transferDataToIndexPassTSH(name, value);
                return dataMappingPassTSH[name][index];
            };

            function Pass_TSH(data) {
                const result = [
                    getMappingDataFromPassTSH("duong_doi", data.duong_doi),
                    getMappingDataFromPassTSH("su_menh_lon", data.su_menh_lon),
                    getMappingDataFromPassTSH("ket_noi", data.ket_noi),
                    getMappingDataFromPassTSH("truong_thanh", data.truong_thanh),
                    getMappingDataFromPassTSH("linh_hon_nho", data.linh_hon_nho),
                    getMappingDataFromPassTSH("nhan_cach_nho", data.nhan_cach_nho),
                    getMappingDataFromPassTSH("su_menh_nho", data.su_menh_nho),
                    getMappingDataFromPassTSH("nang_luc", data.nang_luc),
                    getMappingDataFromPassTSH("tu_duy_hop_ly", data.tu_duy_hop_ly),
                    getMappingDataFromPassTSH("thieu", data.thieu),
                    getMappingDataFromPassTSH(
                        "phan_hoi_tiem_thuc",
                        data.phan_hoi_tiem_thuc
                    ),
                    getMappingDataFromPassTSH("diem_bao_mat", data.diem_bao_mat),
                    getMappingDataFromPassTSH("linh_hon_lon", data.linh_hon_lon),
                    getMappingDataFromPassTSH("nhan_cach_lon", data.nhan_cach_lon),
                    getMappingDataFromPassTSH("su_menh_lon", data.su_menh_lon),
                    getMappingDataFromPassTSH("nam_ca_nhan", data.nam_ca_nhan),
                    getMappingDataFromPassTSH("no_nghiep", data.no_nghiep),
                    getMappingDataFromPassTSH("chu_ky_vong_doi", data.chu_ky_vong_doi),
                    getMappingDataFromPassTSH("dinh_cao", data.dinh_cao),
                    getMappingDataFromPassTSH("thu_thach", data.thu_thach),
                ];
                const filteredResult = result.filter(item => item !== "");
                return filteredResult.join(", ").replace(/\./g, ", ");
            }

            function diemBaoMatHasYellowColor(diemBaoMat) {
                const arr = diemBaoMat.toString().split("/");
                for (const t of arr) {
                    if (t == 13 || t == 14 || t == 16 || t == 19) {
                        return true;
                    }
                }
                return false;
            };
            
            let chartInstance;

            function getNguHanhSumValuesForYears(ngay, thang) {
                const startYear = new Date().getFullYear();
                const nguHanhValues = [];
                for (let i = 0; i < 6; i++) {
                    const nguHanhValue = getNguHanhFromMaTran(MaTranTamLy(ngay, thang, startYear + i - 1));
                    nguHanhValues.push(nguHanhValue);
                }
                return nguHanhValues;
            };
            
            function getNguHanhNumberValuesForYears(ngay, thang) {
                const startYear = new Date().getFullYear();
                const nguHanhValues = [];
                for (let i = 0; i < 6; i++) {
                    const nguHanhValue = getNguHanhFromMaTran(MaTranTamLy(ngay, thang, startYear + i - 1), true);
                    nguHanhValues.push(nguHanhValue);
                }
                return nguHanhValues;
            };

            function createChart(inputNgay, inputThang, dataMaTrans){
                const chartCanvas = $("#chart")[0].getContext("2d");
                const currentYear = new Date().getFullYear();
                const labels = Array.from({ length: 6 }, (_, i) => (currentYear + i - 1).toString());
                var kim = [], moc = [], thuy = [], hoa = [], tho = [];
                for(var i = 0; i < 6; i++) {
                    kim.push(dataMaTrans[i][0]);
                    moc.push(dataMaTrans[i][1]);
                    thuy.push(dataMaTrans[i][2]);
                    hoa.push(dataMaTrans[i][3]);
                    tho.push(dataMaTrans[i][4]);
                }
    
                const data = {
                        labels: labels,
                        datasets: [
                            {
                                label: "Kim",
                                data: kim,
                                borderColor: "gold",
                                backgroundColor: "rgba(255, 215, 0, 0.2)",
                                fill: false,
                                tension: 0,
                            },
                            {
                                label: "Mộc",
                                data: moc,
                                borderColor: "green",
                                backgroundColor: "rgba(0, 128, 0, 0.2)",
                                fill: false,
                                tension: 0,
                            },
                            {
                                label: "Thủy",
                                data: thuy,
                                borderColor: "blue",
                                backgroundColor: "rgba(0, 0, 255, 0.2)",
                                fill: false,
                                tension: 0,
                            },
                            {
                                label: "Hỏa",
                                data: hoa,
                                borderColor: "red",
                                backgroundColor: "rgba(255, 0, 0, 0.2)",
                                fill: false,
                                tension: 0,
                            },
                            {
                                label: "Thổ",
                                data: tho,
                                borderColor: "brown",
                                backgroundColor: "rgba(165, 42, 42, 0.2)",
                                fill: false,
                                tension: 0,
                            },
                        ],
                    };
                const config = {
                    type: 'line',
                    data: data,
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'NĂM'
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'GIÁ TRỊ'
                                }
                            }
                        }
                    }
                };
                if (chartInstance) {
                    chartInstance.destroy();
                }
                chartInstance = new Chart(chartCanvas, config);
            };

            function getSoDon(data) {
                if (data === "" || +data < 10) return data;
                const elements = data.split("/");
                for (let i = 0; i < elements.length; i++) {
                    let e = parseInt(elements[i], 10);
                    if (e < 10) {
                        return e;
                    }
                }
            }

            function showNguHanhSumValuesForYears(ngay, thang, datasMaTrans){
                const currentYear = new Date().getFullYear();
                const dataMaTrans = getNguHanhSumValuesForYears(ngay, thang, currentYear);
                for(var i = 0; i < 6; i++) {
                    $(`#kim_nam${i + 1}`).html(dataMaTrans[i][0]);
                    $(`#moc_nam${i + 1}`).html(dataMaTrans[i][1]);
                    $(`#thuy_nam${i + 1}`).html(dataMaTrans[i][2]);
                    $(`#hoa_nam${i + 1}`).html(dataMaTrans[i][3]);
                    $(`#tho_nam${i + 1}`).html(dataMaTrans[i][4]);
                }
            };
        
            function showNguHanhRawValuesForYears(ngay, thang, datasMaTrans){
                const currentYear = new Date().getFullYear();
                const dataMaTrans = getNguHanhNumberValuesForYears(ngay, thang, true);
                for(var i = 0; i < 6; i++) {
                    $(`#kim1_nam${i + 1}`).html(dataMaTrans[i][0]);
                    $(`#moc1_nam${i + 1}`).html(dataMaTrans[i][1]);
                    $(`#thuy1_nam${i + 1}`).html(dataMaTrans[i][2]);
                    $(`#hoa1_nam${i + 1}`).html(dataMaTrans[i][3]);
                    $(`#tho1_nam${i + 1}`).html(dataMaTrans[i][4]);
                }
            };

            function generateYearLabel() {
                const currentYear = new Date().getFullYear();
                for(var i = 1; i <= 6; i++) {
                    $(`.year-label-${i}`).html(currentYear + i - 2);
                }
            }

            function formatDate(date) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }

            // trung-hx add source

            function setDataToMapKimTuDo(baChuKyVongDoi,
                inputNam,
                namVaTuoiDinhCao1KimTuDo, namVaTuoiDinhCao3KimTuDo,
                dinh1_Doc, dinh2_Doc, dinh3_Doc, dinh4_Doc,
                dinh1_Ngang, dinh2_Ngang, dinh3_Ngang, dinh4_Ngang,
                thuThach1_Doc, thuThach2_Doc, thuThach3_Doc, thuThach4_Doc,
                thuThach1_Ngang, thuThach2_Ngang, thuThach3_Ngang, thuThach4_Ngang,
                itemKimTuDo4TuoiDinhCao, itemKimTuDo5TuoiDinhCao, itemKimTuDo6TuoiDinhCao, itemKimTuDo7TuoiDinhCao,
                namCaNhan_Doc, thangCaNhan_Doc, ngayCaNhan_Doc
            ) {

                $("#tuoiDinhCao0KimTuDo").html("0T <br /> " + inputNam);
                $("#tuoiDinhCao1KimTuDo").html(namVaTuoiDinhCao1KimTuDo);
                $("#tuoiDinhCao3KimTuDo").html(namVaTuoiDinhCao3KimTuDo);

                $(".itemKimTuDo1").html(getMin(baChuKyVongDoi.split("-")[0]));
                $(".itemKimTuDo2").html(getMin(baChuKyVongDoi.split("-")[1]));
                $(".itemKimTuDo3").html(getMin(baChuKyVongDoi.split("-")[2]));
                $(".chuKyVongDoi1KimTuDoPopup").html(baChuKyVongDoi.split("-")[0]);
                $(".chuKyVongDoi2KimTuDoPopup").html(baChuKyVongDoi.split("-")[1]);
                $(".chuKyVongDoi3KimTuDoPopup").html(baChuKyVongDoi.split("-")[2]);


                $("#itemKimTuDo4").html(getMin(dinh1_Doc));
                $("#itemKimTuDo5").html(getMin(dinh2_Doc));
                $("#itemKimTuDo6").html(getMin(dinh3_Doc));
                $("#itemKimTuDo7").html(getMin(dinh4_Doc));
                $("#itemKimTuDo4Popup").html("Dọc: " + dinh1_Doc + " <br /> " + "Ngang: " + dinh1_Ngang);
                $("#itemKimTuDo5Popup").html("Dọc: " + dinh2_Doc + " <br /> " + "Ngang: " + dinh2_Ngang);
                $("#itemKimTuDo6Popup").html("Dọc: " + dinh3_Doc + " <br /> " + "Ngang: " + dinh3_Ngang);
                $("#itemKimTuDo7Popup").html("Dọc: " + dinh4_Doc + " <br /> " + "Ngang: " + dinh4_Ngang);
                $("#ketQuaTuoiDinhCao1").html(dinh1_Doc + "-" + dinh1_Ngang);
                $("#ketQuaTuoiDinhCao2").html(dinh2_Doc + "-" + dinh2_Ngang);
                $("#ketQuaTuoiDinhCao3").html(dinh3_Doc + "-" + dinh3_Ngang);
                $("#ketQuaTuoiDinhCao4").html(dinh4_Doc + "-" + dinh4_Ngang);

                $("#itemKimTuDo8").html(getMin(thuThach1_Doc));
                $("#itemKimTuDo9").html(getMin(thuThach2_Doc));
                $("#itemKimTuDo10").html(getMin(thuThach3_Doc));
                $("#itemKimTuDo11").html(getMin(thuThach4_Doc));
                $("#itemKimTuDo8Popup").html("Dọc: " + thuThach1_Doc + " <br /> " + "Ngang: " + thuThach1_Ngang);
                $("#itemKimTuDo9Popup").html("Dọc: " + thuThach2_Doc + " <br /> " + "Ngang: " + thuThach2_Ngang);
                $("#itemKimTuDo10Popup").html("Dọc: " + thuThach3_Doc + " <br /> " + "Ngang: " + thuThach3_Ngang);
                $("#itemKimTuDo11Popup").html("Dọc: " + thuThach4_Doc + " <br /> " + "Ngang: " + thuThach4_Ngang);
                $("#thachThucTuoiDinhCao1").html(thuThach1_Doc + "-" + thuThach1_Ngang);
                $("#thachThucTuoiDinhCao2").html(thuThach2_Doc + "-" + thuThach2_Ngang);
                $("#thachThucTuoiDinhCao3").html(thuThach3_Doc + "-" + thuThach3_Ngang);
                $("#thachThucTuoiDinhCao4").html(thuThach4_Doc + "-" + thuThach4_Ngang);

                $("#itemKimTuDo4TuoiDinhCao").html(itemKimTuDo4TuoiDinhCao);
                $("#itemKimTuDo5TuoiDinhCao").html(itemKimTuDo5TuoiDinhCao);
                $("#itemKimTuDo6TuoiDinhCao").html(itemKimTuDo6TuoiDinhCao);
                $("#itemKimTuDo7TuoiDinhCao").html(itemKimTuDo7TuoiDinhCao);

                $("#namCaNhan_ChiSo").html(getMin(namCaNhan_Doc));
                $("#thangCaNhan_ChiSo").html(getMin(thangCaNhan_Doc));
                $("#ngayCaNhan_ChiSo").html(getMin(ngayCaNhan_Doc));
            }


            // set itemKimTuDo 4~11
            function getMin (dinh) {
                var itemKimTuDo;
                if (dinh.toString().includes("/")) {
                    var arr = dinh.split("/");
                    var itemKimTuDo = Math.min(...arr);
                } else {
                    itemKimTuDo = dinh;
                }
                return itemKimTuDo
            }

            function saveHistoriSearch(){

                let resultFunc = false;
                var urlApi = (window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/saveHistoriSearch'
                //var urlApi = 'http://localhost/beli/wp-json/readerinfo/v1/saveHistoriSearch';
        
                $('#shareBtn').html('Chia sẻ');

                var emailUserSearch = '';
                var isSearchDataByShare = isSearchDataByShareFunc();
                // trường hợp là chia sẽ thì lấy thông tin người chia sẽ để search và cập nhật
                if (isSearchDataByShare){
                    emailUserSearch = getUsersharesearch();
                } else{
                    emailUserSearch = localStorage.getItem("emailUser");
                }
                
                var emailUser = localStorage.getItem("emailUser");
                var codeUser = localStorage.getItem("codeUser");
                var userType = localStorage.getItem("userType");
                var nameSearch1 = $("#hoTen").val();
                var nameSearch2 = $("#inputTenThuongGoi").val();
                var dateSearch = $("#ngay").val();
                var monthSearch = $("#thang").val();
                var yearSearch = $("#nam").val();

        
                var dataApi={
                    'emailUser': emailUser,
                    'codeUser': codeUser,
                    'userType': userType,
                    'emailUserSearch': emailUserSearch,
                    'nameSearch1': nameSearch1,
                    'nameSearch2': nameSearch2,
                    'dateSearch': dateSearch,
                    'monthSearch': monthSearch,
                    'yearSearch': yearSearch,
                    'isSearchDataByShare': isSearchDataByShare
                };
        
                // show summernotebtn
                $( "#summernotebtn" ).show();
                // hide summernotebtnSave
                $( "#summernotebtnSave" ).hide();
                // hide summernotebtnCancel
                $( "#summernotebtnCancel" ).hide();
                
                //showLoading();
                $.ajax({
                url: urlApi,
                async: false,
                type: 'POST',
                data: dataApi,
                dataType: "json"
                }).done(function(data){
                    let result = data.result;
                    let message = data.message;
                    let noteSearch = data.noteSearch;
                    let thoiDiem1 = data.thoiDiem1;
                    let thoiDiem2 = data.thoiDiem2;
                    let thoiDiem3 = data.thoiDiem3;
                    let thoiDiem4 = data.thoiDiem4;
                    let thoiDiem5 = data.thoiDiem5;
                    let thoiDiem6 = data.thoiDiem6;

                    if (!result){
                        alert (message);
                        resultFunc = false;
                    }else {
                        if(noteSearch){
                            $("#summernotetext").show();
                            $('.note-editor').hide();
                            $('#summernotetext').html(noteSearch);
                            $('#summernotebtn').html('Cập nhật ghi chú');
                        }else {
                            $('#summernotetext').empty();
                            $('.note-editor').hide();
                            $("#summernotetext").hide();
                            $('#summernotebtn').html('Thêm ghi chú');
                        }
                        
                        $('#thoiDiem1').val(thoiDiem1);
                        $('#thoiDiem2').val(thoiDiem2);
                        $('#thoiDiem3').val(thoiDiem3);
                        $('#thoiDiem4').val(thoiDiem4);
                        $('#thoiDiem5').val(thoiDiem5);
                        $('#thoiDiem6').val(thoiDiem6);

                        resultFunc = true;
                    }
                }).fail(function(error){
                    $('#summernotetext').empty();
                    $('.note-editor').hide();
                    $("#summernotetext").hide();
                    $('#summernotebtn').html('Thêm ghi chú');
                    resultFunc = false;
                });
                return resultFunc;
            }

            function transferData(sinhNhat, hoVaTen, tenThuongGoi, inputNgay, inputThang, inputNam, currentDate, currentMonth){
                var dataResult = {};
                var urlApi = (window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/transferData'
                //var urlApi = 'http://localhost/beli/wp-json/readerinfo/v1/transferData';
        
                var dataApi={
                    'sinhNhat': sinhNhat,
                    'hoVaTen': hoVaTen,
                    'tenThuongGoi': tenThuongGoi,
                    'inputNgay': inputNgay,
                    'inputThang': inputThang,
                    'inputNam': inputNam,
                    'currentDate': currentDate,
                    'currentMonth': currentMonth
                };
        
                //showLoading();
                $.ajax({
                url: urlApi,
                async: false,
                type: 'POST',
                data: dataApi,
                dataType: "json"
                }).done(function(data){
                    let result = data.result;
                    let message = data.message;

                    if (!result){
                        alert (message);
                        dataResult = {
                            result:  false
                        };
                    }else {
                        dataResult = {
                            result:  true,
                            duongDoi_Doc: data.duongDoi_Doc,
                            duongDoi_Ngang: data.duongDoi_Ngang,
                            suMenhLon_Doc: data.suMenhLon_Doc,
                            suMenhLon_Ngang: data.suMenhLon_Ngang,
                            ketNoi_Doc: data.ketNoi_Doc,
                            ketNoi_Ngang: data.ketNoi_Ngang,
                            truongThanh_Doc: data.truongThanh_Doc,
                            truongThanh_Ngang: data.truongThanh_Ngang,
                            linhHonNho_Doc: data.linhHonNho_Doc,
                            linhHonNho_Ngang: data.linhHonNho_Ngang,
                            nhanCachNho_Doc: data.nhanCachNho_Doc,
                            nhanCachNho_Ngang: data.nhanCachNho_Ngang,
                            nhanCachLon_Doc: data.nhanCachLon_Doc,
                            nhanCachLon_Ngang: data.nhanCachLon_Ngang,
                            soMenhNho_Doc: data.soMenhNho_Doc,
                            soMenhNho_Ngang: data.soMenhNho_Ngang,
                            ngaySinh_Doc: data.ngaySinh_Doc,
                            ngaySinh_ChiSo: data.ngaySinh_ChiSo,
                            tuDuyHopLy_Doc: data.tuDuyHopLy_Doc,
                            tuDuyHopLy_Ngang: data.tuDuyHopLy_Ngang,
                            thieu: data.thieu,
                            phanHoiTiemThuc_Doc: data.phanHoiTiemThuc_Doc,
                            linhHonLon_Doc: data.linhHonLon_Doc,
                            linhHonLon_Ngang: data.linhHonLon_Ngang,
                            diemBaoMat: data.diemBaoMat,
                            diemBaoMat_ChiSo: data.diemBaoMat_ChiSo,
                            namCaNhan_Doc: data.namCaNhan_Doc,
                            namCaNhan_Ngang: data.namCaNhan_Ngang,
                            thangCaNhan_Ngang: data.thangCaNhan_Ngang,
                            thangCaNhan_Doc: data.thangCaNhan_Doc,
                            ngayCaNhan_Ngang: data.ngayCaNhan_Ngang,
                            ngayCaNhan_Doc: data.ngayCaNhan_Doc,
                            thaiDo_Doc: data.thaiDo_Doc,
                            thaiDo_Ngang: data.thaiDo_Ngang,
                            canBang_Doc: data.canBang_Doc,
                            canBang_Ngang: data.canBang_Ngang,
                            bonNamDinhCao: data.bonNamDinhCao,
                            bonDinhGiaiDoanCuocDoi_Ngang: data.bonDinhGiaiDoanCuocDoi_Ngang,
                            bieuDoNgaySinh: data.bieuDoNgaySinh,
                            maTranTamLy: data.maTranTamLy,
                            bieuDoNgaySinh_ThuongGoi: data.bieuDoNgaySinh_ThuongGoi,
                            bieuDoNgaySinh_DayDu: data.bieuDoNgaySinh_DayDu,
                            bonThuThach: data.bonThuThach,
                            thuThach1_Ngang: data.thuThach1_Ngang,
                            thuThach2_Ngang: data.thuThach2_Ngang,
                            thuThach4_Ngang: data.thuThach4_Ngang,
                            noiTam: data.noiTam,
                            noiTam_Doc: data.noiTam_Doc,
                            noiTam_Ngang: data.noiTam_Ngang,
                            tuongTac: data.tuongTac,
                            tuongTac_Doc: data.tuongTac_Doc,
                            tuongTac_Ngang: data.tuongTac_Ngang,
                            phatTrien: data.phatTrien,
                            phatTrien_Doc: data.phatTrien_Doc,
                            phatTrien_Ngang: data.phatTrien_Ngang
                        };
                    }
                    //hideLoading()
                }).fail(function(error){
                    alert ("Xử lý dữ liệu lỗi, xin hãy thử lại");
                    dataResult = {
                        result:  false
                    };
                    //hideLoading()
                });
                return dataResult;
            }

            function validateUser(){

                let userType = localStorage.getItem("userType");
                if(!userType){
                    return false;
                }
                return true;

            }

            function displayData(){
                let userType = localStorage.getItem("userType");

                var urlApi = (window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/getInfoDisplay'
                //var urlApi = 'http://localhost/beli/wp-json/readerinfo/v1/getInfoDisplay';
        
                var dataApi={
                    'userType': userType
                };

                $.ajax({
                url: urlApi,
                async: false,
                type: 'POST',
                data: dataApi,
                dataType: "json"
                }).done(function(data){
                    let isHideTitle = true;
                    if(data.display_chiso != 1){ $('.display-chiso').addClass('hide');} else { $('.display-chiso').removeClass('hide'); }
                    if(data.display_matrantamly != 1){ $('.display-matrantamly').addClass('hide'); } else { $('.display-matrantamly').removeClass('hide'); }
                    if(data.display_SOULPLAN != 1){ $('.display-SOULPLAN').addClass('hide'); } else { $('.display-SOULPLAN').removeClass('hide'); }
                    if(data.display_Chukivongdoi_Tuoidinhcao != 1){ $('.display-Chukivongdoi_Tuoidinhcao').addClass('hide'); } else { $('.display-Chukivongdoi_Tuoidinhcao').removeClass('hide'); }
                    if(data.display_bieudo != 1){ $('.display-bieudo').addClass('hide'); } else { $('.display-bieudo').removeClass('hide'); }
                    if(data.display_ghichu != 1){ $('.display-ghichu').addClass('hide'); } else { $('.display-ghichu').removeClass('hide'); }
                    if(data.display_bangnguhanh1 != 1){ $('.display-bangnguhanh1').addClass('hide'); } else { $('.display-bangnguhanh1').removeClass('hide'); }
                    if(data.display_bangnguhanh2 != 1){ $('.display-bangnguhanh2').addClass('hide'); } else { $('.display-bangnguhanh2').removeClass('hide'); }
                    if(data.display_bienthiennguhanh != 1){ $('.display-bienthiennguhanh').addClass('hide'); } else { $('.display-bienthiennguhanh').removeClass('hide'); }
                    if(data.display_bangtaivan != 1){ $('.display-bangtaivan').addClass('hide'); } else { $('.display-bangtaivan').removeClass('hide'); }

                    if(data.display_duongdoi != 1){ $('.display-duongdoi').addClass('hide'); } else { $('.display-duongdoi').removeClass('hide'); isHideTitle = false;}
                    if(data.display_sumenhlon != 1){ $('.display-sumenhlon').addClass('hide'); } else { $('.display-sumenhlon').removeClass('hide'); isHideTitle = false;}
                    if(data.display_ketnoi != 1){ $('.display-ketnoi').addClass('hide'); } else { $('.display-ketnoi').removeClass('hide'); isHideTitle = false;}
                    if(data.display_truongthanh != 1){ $('.display-truongthanh').addClass('hide'); } else { $('.display-truongthanh').removeClass('hide'); isHideTitle = false;}
                    if(data.display_linhhonlonnho != 1){ $('.display-linhhonlonnho').addClass('hide'); } else { $('.display-linhhonlonnho').removeClass('hide'); isHideTitle = false;}
                    if(data.display_nhancachlonnho != 1){ $('.display-nhancachlonnho').addClass('hide'); } else { $('.display-nhancachlonnho').removeClass('hide'); isHideTitle = false;}
                    if(data.display_sumenhlonnho != 1){ $('.display-sumenhlonnho').addClass('hide'); } else { $('.display-sumenhlonnho').removeClass('hide'); isHideTitle = false;}
                    if(data.display_thaido != 1){ $('.display-thaido').addClass('hide'); } else { $('.display-thaido').removeClass('hide'); isHideTitle = false;}
                    if(data.display_ngaysinh != 1){ $('.display-ngaysinh').addClass('hide'); } else { $('.display-ngaysinh').removeClass('hide'); isHideTitle = false;}
                    if(data.display_tuduyhoply != 1){ $('.display-tuduyhoply').addClass('hide'); } else { $('.display-tuduyhoply').removeClass('hide'); isHideTitle = false;}
                    if(data.display_thieu != 1){ $('.display-thieu').addClass('hide'); } else { $('.display-thieu').removeClass('hide'); isHideTitle = false;}
                    if(data.display_phanhoitiemthuc != 1){ $('.display-phanhoitiemthuc').addClass('hide'); } else { $('.display-phanhoitiemthuc').removeClass('hide'); isHideTitle = false;}
                    if(data.display_diembaomat != 1){ $('.display-diembaomat').addClass('hide'); } else { $('.display-diembaomat').removeClass('hide'); isHideTitle = false;}
                    if(data.display_canbang != 1){ $('.display-canbang').addClass('hide'); } else { $('.display-canbang').removeClass('hide'); isHideTitle = false;}
                    if(data.display_noitam != 1){ $('.display-noitam').addClass('hide'); } else { $('.display-noitam').removeClass('hide'); isHideTitle = false;}
                    if(data.display_tuongtac != 1){ $('.display-tuongtac').addClass('hide'); } else { $('.display-tuongtac').removeClass('hide'); isHideTitle = false;}
                    if(data.display_phattrien != 1){ $('.display-phattrien').addClass('hide'); } else { $('.display-phattrien').removeClass('hide'); isHideTitle = false;}

                    if(isHideTitle){
                        $('.display-title').addClass('hide');
                    }
                }).fail(function(error){

                });
            }

            function isSearchDataByShareFunc(){
                if (!getUsersharesearch()){
                    return false;
                }

                return true;
            }

            // get data param url GET by name param
            function getUsersharesearch(){
                let usersharesearch = $("#usersharesearch").val();
                usersharesearch = usersharesearch.replaceAll(" ", ".")
                return usersharesearch;
            }

            function showLoading() {
                // show loading
                $('.loading').show();
            }
        
            function hideLoading() {
                // hide loading
                $('.loading').hide();
            }

            // function showLoadingPopup
            function showLoadingPopup(){
                $('#loadingPopup').show();
            }

            // function hideLoadingPopup
            function hideLoadingPopup(){
                $('#loadingPopup').hide();
            }
});