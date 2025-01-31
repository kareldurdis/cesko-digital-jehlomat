package services
import api.UserTable.Companion.verificationCode
import com.mailjet.client.errors.MailjetException
import com.mailjet.client.MailjetClient
import com.mailjet.client.MailjetRequest
import com.mailjet.client.MailjetResponse
import com.mailjet.client.ClientOptions
import com.mailjet.client.resource.Emailv31
import model.Organization
import model.user.User
import org.json.JSONArray
import org.json.JSONObject

interface MailerService {
    fun sendRegistrationConfirmationEmail(organization: Organization, userEmail: String, verificationCode: String)
    fun sendOrgAdminConfirmationEmail(user: User, organizationName: String)
    fun sendOrganizationConfirmationEmail(organization: Organization, adminEmail: String)
    fun sendSyringeFindingConfirmation(email: String, syringeId: String)
    fun sendSyringeFinding(organization: Organization, email: String, syringeId: String)
    fun sendPassResetEmail(email: String, userId: Int, resetUrlCode: String)
}


class FakeMailer: MailerService {
    override fun sendRegistrationConfirmationEmail(
        organization: Organization,
        userEmail: String,
        verificationCode: String
    ) {
        println("sendRegistrationConfirmationEmail")
    }
    override fun sendOrganizationConfirmationEmail(organization: Organization, adminEmail: String) {
        println("sendOrganizationConfirmationEmail")
    }
    override fun sendOrgAdminConfirmationEmail(user: User, organizationName: String){
        println("sendOrgAdminConfirmationEmail user: ${user.username}, organizationName: $organizationName, code: ${user.verificationCode}")
    }
    override fun sendSyringeFindingConfirmation(email: String, syringeId: String) {
        println("sendSyringeFindingConfirmation")
    }
    override fun sendSyringeFinding(organization: Organization, email: String, syringeId: String) {
        println("sendSyringeFinding")
    }
    override fun sendPassResetEmail(email: String, userId: Int, resetUrlCode: String) {
        println("sendPassResetEmail email: $email, id: $userId, code: $resetUrlCode")
    }
}


class Mailer: MailerService {
    private val publicUrl = System.getenv("FRONTEND_URL")
    private val client = MailjetClient(
        ClientOptions.builder()
            .apiKey(System.getenv("MAILJET_PUBLIC_KEY"))
            .apiSecretKey(System.getenv("MAILJET_PRIVATE_KEY"))
            .build())

    private fun prepareBodyWithLink(
        templateId: Int,
        subject: String,
        link: String,
        toEmail: String,
        organizationName: String
    ): JSONArray {
        return prepareBodyGeneral(templateId, subject, toEmail, organizationName, JSONObject().put("CONFIRM_LINK", link))
    }

    private fun prepareBodyGeneral(
        templateId: Int,
        subject: String,
        toEmail: String,
        toName: String,
        attributes: JSONObject
    ): JSONArray {
        return JSONArray()
            .put(
                JSONObject()
                    .put(
                        Emailv31.Message.FROM, JSONObject()
                            .put("Email", "info@jehlomat.cz")
                            .put("Name", "Jehlomat")
                    )
                    .put(
                        Emailv31.Message.TO, JSONArray()
                            .put(
                                JSONObject()
                                    .put("Email", toEmail)
                                    .put("Name", toName)
                            )
                    )
                    .put(Emailv31.Message.TEMPLATEID, templateId)
                    .put(Emailv31.Message.TEMPLATELANGUAGE, true)
                    .put(Emailv31.Message.SUBJECT, subject)
                    .put(Emailv31.Message.VARIABLES,  attributes
                    )
            )
    }

    @Throws(MailjetException::class)
    override fun sendOrganizationConfirmationEmail(organization: Organization, adminEmail: String) {
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES, prepareBodyGeneral(
                    3712102,
                    "Schválení organizace",
                    PermissionService.getSuperAdminEmail(),
                    "Super Admin",
                    JSONObject()
                        .put("CONFIRM_LINK", "${publicUrl}organizace/povoleni/${organization.id}")
                        .put("ORGANIZATION_NAME", organization.name)
                        .put("ORGANIZATION_EMAIL", adminEmail)
                )
            )
        client.post(request)
    }

    @Throws(MailjetException::class)
    override fun sendRegistrationConfirmationEmail(
        organization: Organization,
        userEmail: String,
        verificationCode: String
    ) {
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES, prepareBodyWithLink(
                    3222927,
                    "Dokončení registrace",
                    "${publicUrl}uzivatel/registrace/?email=${userEmail}&code=${verificationCode}",
                    userEmail,
                    organization.name
                )
            )
        client.post(request)
    }

    @Throws(MailjetException::class)
    override fun sendOrgAdminConfirmationEmail(
        user: User,
        organizationName: String
    ) {
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES, prepareBodyGeneral(
                    3918960,
                    "Dokončení registrace administrátora organizace",
                    user.email,
                    user.username,
                    JSONObject()
                        .put("CONFIRM_LINK", "${publicUrl}organizace/admin/povoleni/?userId=${user.id}&code=${user.verificationCode}")
                        .put("ORGANIZATION_NAME", organizationName)
                )
            )
        client.post(request)
    }

    @Throws(MailjetException::class)
    override fun sendSyringeFindingConfirmation(email: String, syringeId: String) {
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES, prepareBodyWithLink(
                    3222932,
                    "Potvrzení zaznamenání nálezu",
                    "${publicUrl}nalezy/trackovani-nalezu/$syringeId",
                    email,
                    ""
                )
            )
        client.post(request)
    }

    @Throws(MailjetException::class)
    override fun sendSyringeFinding(organization: Organization, email: String, syringeId: String) {
        val request = MailjetRequest(Emailv31.resource)
            .property(
                Emailv31.MESSAGES, prepareBodyWithLink(
                    3222921,
                    "Nález",
                    "${publicUrl}api/v1/jehlomat/syringe/$syringeId",
                    email,
                    organization.name
                )
            )
        client.post(request)
    }

    @Throws(MailjetException::class)
    override fun sendPassResetEmail(email: String, userId: Int, resetUrlCode: String) {
         val request = MailjetRequest(Emailv31.resource)
             .property(
                 Emailv31.MESSAGES, prepareBodyWithLink(
                     3884047,
                     "Požadavek na reset hesla",
                     "${publicUrl}uzivatel/heslo/?userId=${userId}&code=${resetUrlCode}",
                     email,
                     ""
                 )
             )
         client.post(request)
    }
}
