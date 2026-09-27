export class ClientModel {
    static getFullName(client) {
        return `${client?.prenom || ''} ${client?.nom || ''}`.trim();
    }
}
