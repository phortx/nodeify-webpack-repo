import Model from '../model';


export default class User extends Model {
    static entity = 'users';

    static fields () {
        return {
            id: this.increment(),
            password: this.string(''),
            email: this.string(''),
        };
    }
}
