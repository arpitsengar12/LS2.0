export class Constant {
  public static readonly EMAIL_REGEXP = /^[a-z0-9_%+-]+(\.[a-z0-9-]+)?@[a-z0-9-]+\.[a-z]{2,4}$/;
  public static readonly EMAIL_REGEXPSpChar = /^[a-z0-9._%+\-*]+@[a-z0-9.\-*]+\.[a-z*]{2,4}$/;
  public static mobileNo(event: any) {
    const pattern = new RegExp('^[0-9_-]+$');
    var keyCode = event.keyCode;
    if (event.charCode !== 32) {
      const inputChar = String.fromCharCode(event.charCode);
      if (keyCode >= 48 && keyCode <= 57) {
        return false;
      } else {
        event.preventDefault();
        // return true;
      }
    }
    return false;
  }
  public static passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!*_\-])[A-Za-z\d@#$%^&+=!*_\-]{8,14}$/;
  public static zeroToOne = /^(0(\.\d{1,})?|1(\.0)?)$/;
  public static textInputWtOutWS = /^[a-zA-Z]{2,}[a-zA-Z0-9-*.]*$/;
  public static userNameInput = /^[a-zA-Z]{2,}[a-zA-Z0-9.]*$/;
  public static userNameInputSpChar = /^[a-zA-Z]{2,}[a-zA-Z0-9.*]*$/;
  public static textInputWSpChar = /^[a-zA-Z]{2,}[a-zA-Z0-9@#$%^&*-.]*$/;
  public static textInputWSpCharWS = /^[a-zA-Z]{2,}[a-zA-Z0-9@#$%^&*-.\s]*$/
  public static textInput = /^[a-zA-Z]{2,}[a-zA-Z0-9\s\-]*$/;
  public static textInputWtNum = /^[A-Za-z\s.-]+[A-Za-z]$/;
  public static phoneRegExp = /^[0-9]{10}$/;
  public static phoneRegExpwSpChar = /^[0-9*]{10}$/;
  public static faxNumber = /^\+?[0-9\-\(\) ]+$/;
  public static accessToken: string = 'AccessToken';
  public static email: string = 'Email';
  public static expires: string = 'Expires';
  public static id: string = 'Id';
  public static companyId: string = 'CompanyId';
  public static userName: string = 'Name';
  public static roleName: string = 'RoleName';
  public static roleId: string = 'RoleId';
  public static departmentId: string = 'DepartmentId';
  public static userId: string = 'UserId';
  public static theme: string = 'theme';
  public static applicationId: string = 'applicationId';
  public static panNumber = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  public static panNumberSpChar = /^[A-Z*]{5}[0-9*]{4}[A-Z*]$/;
  public static tanNumber = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
  public static tanNumberSpChar = /^[A-Z*]{4}[0-9*]{5}[A-Z*]$/;
  public static GSTNumber = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  public static GSTNumberSpChar = /^[0-9]{2}[A-Z*]{5}[0-9*]{4}[A-Z*]{1}[1-9A-Z*]{1}[Z*]{1}[0-9A-Z*]{1}$/;
  public static IntNo = /^[0-9]{1,50}$/;
  public static IntNoWtZero = /^(?!0)[0-9]{1,50}$/;
  public static IntNoSpChar = /^[0-9]{1}([0-9*]{1,49})?$/;
  public static decimalNo = /^[0-9]*\.?[0-9]+$/;
  public static pinCode = /^[0-9]{6}$/;
  public static pinCodeSpChar = /^[0-9]{2}[0-9*]{4}$/;
  public static DateInput = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  public static dateFormatDDMMYYYY = /^\d{2}-\d{2}-\d{4}$/; //to match date format (DD-MM-YYYY)
  public static maxSizeImage: number = 5242880; // 5mb
  public static imageType = ['jpeg', 'jpg', 'png', 'svg', 'jfif', 'gif'];
  public static excelType = ['xlsx', 'xls'];
  public static videoType = ['mp4', 'avi', 'mov', 'mkv', 'wmv'];
  public static pdfType = ['pdf'];
  public static socialFileType = ['jpeg', 'jpg', 'png', 'svg', 'jfif', 'gif', 'mp4', 'avi', 'mov', 'mkv', 'wmv'];
  public static emailAttachmentType = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'mp3', 'wav', 'mp4', 'avi', 'mov', 'zip', 'rar', 'txt', 'csv',
    'jfif',
  ];
  public static errors: any = {
    imageSizeError: 'Image is too large. Over 5 MB',
    excelSizeError: 'Excel file is too large. Over 5 MB',
    videoSizeError: 'Video file is too large. Over 5 MB',
    fileSizeError: 'file is too large. Over 5 MB',
  };

}