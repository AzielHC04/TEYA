
export class RegisterDto {
  name!: string;
  email!: string;
  password!: string;
  role?: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class ChangePasswordDto {
  email!: string;
  currentPassword!: string;
  newPassword!: string;
}
