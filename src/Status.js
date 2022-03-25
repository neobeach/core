/**
 * Exports the status function for uniform Status codes
 *
 * @param code
 * @returns {{code, message: *}|{code, message: string}}
 */
module.exports = (code) => {
    const status = {
        // Generic success code
        1000: 'Request completed',

        // Account success codes
        1010: 'Account activated',
        1011: 'Login successful',
        1012: 'Password reset successful',

        // Email success codes
        1020: 'Email has been send',

        // Form success codes
        1030: 'Form has been submitted',

        // Generic errors code
        5000: 'Server error',

        // Account errors codes
        5010: 'Account not found',
        5011: 'Account not activated',
        5012: 'Login incorrect',
        5013: 'Email/Username not found',

        // Email error codes
        5020: 'Error sending email',

        // Form error codes
        5030: 'Error submitting form',
        5031: 'Missing fields',
        5032: 'Invalid fields',
        5033: 'File to large',
        5034: 'Invalid file type',
        5035: 'CSRF validation failed',

        // Fallback/generic error code
        9999: 'Generic Error'
    };

    if (typeof status[code] === "undefined") {
        throw new Error(`Code: ${code} isn't a valid status code!`);
    }

    if (process.env.NODE_ENV !== 'production') {
        return {
            code,
            message: status[code]
        };
    } else {
        return {
            code,
            message: ''
        };
    }
};
