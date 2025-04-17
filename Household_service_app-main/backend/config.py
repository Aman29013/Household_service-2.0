from flask import app
class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS=False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI="sqlite:///database.sqlite3"
    DEBUG=True
    SECURITY_PASSWORD_HASH ="bcrypt"
    SECURITY_PASSWORD_SALT="mad2"
    SECRET_KEY="mad2"
    SECURITY_TOKEN_AUTHENTICATION_HEADER="Authentication-Token"
    # SECURITY_TOKEN_MAX_AGE = 3600
    # app.config['SECURITY_TOKEN_AUTHENTICATION_KEY'] = 'Bearer' #new added

    CACHE_TYPE="RedisCache"
    CACHE_DEFAULT_TIMEOUT=30
    CACHE_REDIS_PORT=6379

    WTF_CSRF_ENABLED = False