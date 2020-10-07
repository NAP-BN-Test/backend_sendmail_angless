module.exports = {
    MESSAGE: {
        SYS_ERROR: "Lỗi xử lý hệ thống!",
        ACTION_FAIL: "Thao tác thất bại!",
        ACTION_SUCCESS: "Thao tác thành công!",
        LOGIN_SUCCESS: "Đăng nhập thành công!",
        DATA_NOT_FOUND: "Không tìm thấy dữ liệu!",
        LOGIN_FAIL: "Đăng nhập thất bại!",
        INVALID_COMPANY: "Công ty đã tồn tại!",
        NO_PERMISSION: "Bạn không có quyền thực hiện thao tác này!",
        INVALID_USER: "Tên đăng nhập đã tồn tại!",
        BINDING_ERROR: "Lỗi ràng buộc",
    },

    USER_ROLE: {
        GUEST: 0,
        STAFF: 1,
        MANAGER: 2
    },

    STATUS: {
        SUCCESS: 1,
        FAIL: 0
    },

    ACTIVITY_TYPE: {
        ALL: 0,
        CALL: 1,
        EMAIL: 2,
        MEET: 3,
        NOTE: 4,
        TASK: 5
    },

    COMPANY_ROLE: {
        PARENT: 1,
        CHILD: 2
    },

    MAIL_RESPONSE_TYPE: {
        SEND: 1,
        OPEN: 2,
        CLICK_LINK: 3,
        INVALID: 4,
        UNSUBSCRIBE: 5
    },

    TIME_SELECT: {
        TODAY: 1,
        YESTERDAY: 2,
        LAST_24H: 3,
        LAST_7DAY: 4,
        LAST_30DAY: 5,
        THIS_MONTH: 6,
        LAST_MONTH: 7,
        ALL_TIME: 8,
        SELECT: 9,
    },

    TIME_TYPE: {
        HOUR: 1,  //Giờ
        DAY: 2,   //Thứ trong tuần
        DATE: 3,   //Ngày trong tháng
        MONTH: 4   //Tháng trong năm
    }
}