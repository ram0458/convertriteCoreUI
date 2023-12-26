/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_New2",
        editProfile: "B2C_1_edit_new"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://ritesoftwareb2c.b2clogin.com/ritesoftwareb2c.onmicrosoft.com/B2C_1_New2",
        },
        editProfile: {
            authority: "https://ritesoftwareb2c.b2clogin.com/ritesoftwareb2c.onmicrosoft.com/B2C_1_edit_new"
        }
    },
    authorityDomain: "ritesoftwareb2c.b2clogin.com"
}