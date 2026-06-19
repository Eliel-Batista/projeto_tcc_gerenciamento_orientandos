CREATE TABLE password_recovery_codes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_recovery_codes_user_id ON password_recovery_codes(user_id);
CREATE INDEX idx_password_recovery_codes_code ON password_recovery_codes(code);
