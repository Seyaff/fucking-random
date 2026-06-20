import { IUser } from "../modules/user/user.model";

declare global {
    namespace Express {
    
        interface User extends IUser {}
    }
}

export {};