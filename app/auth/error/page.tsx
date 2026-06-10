export default function AuthErrorPage() {
    return (
        <div className="auth-error__page">
            <h1 className="auth-error__heading">Acesso não autorizado</h1>
            <p className="auth-error__message">
                Você precisa acessar esta aplicação através do Moodle para autenticação.
            </p>
            <p className="auth-error__message">
                Caso já tenha feito login, sua sessão pode ter expirado.
            </p>
        </div>
    );
}
