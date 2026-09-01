import logging
import smtplib

from email.message import EmailMessage

from app.core.config import settings


logger = logging.getLogger(__name__)


# ============================================================
# GENERIC EMAIL SENDER
# ============================================================

def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
) -> None:

    if not settings.SMTP_USERNAME:
        raise RuntimeError(
            "SMTP_USERNAME is not configured"
        )

    if not settings.SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_PASSWORD is not configured"
        )

    sender = (
        f"{settings.SMTP_FROM_NAME} "
        f"<{settings.SMTP_FROM_EMAIL}>"
    )

    message = EmailMessage()

    message["Subject"] = subject
    message["From"] = sender
    message["To"] = to_email

    if text_body is None:
        text_body = (
            "This email contains HTML content. "
            "Please open it in an HTML-compatible "
            "email client."
        )

    message.set_content(text_body)

    message.add_alternative(
        html_body,
        subtype="html",
    )

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=20,
        ) as server:

            if settings.SMTP_USE_TLS:
                server.starttls()

            server.login(
                settings.SMTP_USERNAME,
                settings.SMTP_PASSWORD,
            )

            server.send_message(message)

        logger.info(
            "Email sent successfully to %s",
            to_email,
        )

    except Exception:
        logger.exception(
            "Failed to send email to %s",
            to_email,
        )
        raise


# ============================================================
# EMAIL VERIFICATION
# ============================================================

def send_verification_email(
    to_email: str,
    otp: str,
) -> None:

    subject = "Verify your Job Board email"

    html_body = f"""
<!DOCTYPE html>
<html>
<body>

    <h2>Verify your email</h2>

    <p>
        Thank you for registering with Job Board.
    </p>

    <p>
        Your verification code is:
    </p>

    <h1>{otp}</h1>

    <p>
        This code expires in
        <strong>
            {settings.EMAIL_OTP_EXPIRE_MINUTES}
        </strong>
        minutes.
    </p>

    <p>
        If you did not create this account,
        you can ignore this email.
    </p>

    <p>
        Job Board
    </p>

</body>
</html>
"""

    text_body = f"""
Verify your Job Board email.

Thank you for registering with Job Board.

Your verification code is:

{otp}

This code expires in
{settings.EMAIL_OTP_EXPIRE_MINUTES} minutes.

If you did not create this account,
ignore this email.

Job Board
"""

    send_email(
        to_email=to_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


# ============================================================
# APPLICATION CONFIRMATION
# ============================================================

def send_application_confirmation_email(
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    application_id: int,
) -> None:

    subject = (
        f"Application received - {job_title}"
    )

    html_body = f"""
<!DOCTYPE html>
<html>
<body>

    <h2>Application received</h2>

    <p>
        Hello {candidate_name},
    </p>

    <p>
        Your application has been successfully
        submitted.
    </p>

    <h3>{job_title}</h3>

    <p>
        Company:
        <strong>{company_name}</strong>
    </p>

    <p>
        Application ID:
        <strong>{application_id}</strong>
    </p>

    <p>
        Status:
        <strong>Applied</strong>
    </p>

    <p>
        The recruiter will review your application.
    </p>

    <p>
        Job Board
    </p>

</body>
</html>
"""

    text_body = f"""
Application received

Hello {candidate_name},

Your application has been successfully submitted.

Job: {job_title}

Company: {company_name}

Application ID: {application_id}

Status: Applied

The recruiter will review your application.

Job Board
"""

    send_email(
        to_email=candidate_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


# ============================================================
# RECRUITER NOTIFICATION
# ============================================================

def send_recruiter_application_notification(
    recruiter_email: str,
    recruiter_name: str,
    candidate_email: str,
    job_title: str,
    company_name: str,
    application_id: int,
) -> None:

    subject = (
        f"New application - {job_title}"
    )

    html_body = f"""
<!DOCTYPE html>
<html>
<body>

    <h2>New job application</h2>

    <p>
        Hello {recruiter_name},
    </p>

    <p>
        A candidate has applied for your job.
    </p>

    <h3>{job_title}</h3>

    <p>
        Company:
        <strong>{company_name}</strong>
    </p>

    <p>
        Candidate email:
        <strong>{candidate_email}</strong>
    </p>

    <p>
        Application ID:
        <strong>{application_id}</strong>
    </p>

    <p>
        Please log in to Job Board to review
        the application.
    </p>

    <p>
        Job Board
    </p>

</body>
</html>
"""

    text_body = f"""
New job application

Hello {recruiter_name},

A candidate has applied for your job.

Job: {job_title}

Company: {company_name}

Candidate email: {candidate_email}

Application ID: {application_id}

Please log in to Job Board to review
the application.

Job Board
"""

    send_email(
        to_email=recruiter_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


# ============================================================
# JOB RECOMMENDATION
# ============================================================

def send_job_recommendation_email(
    candidate_email: str,
    candidate_name: str,
    jobs: list,
) -> None:

    if not jobs:
        return

    subject = (
        "New jobs matching your preferences"
    )

    # --------------------------------------------------------
    # HTML JOB LIST
    # --------------------------------------------------------

    job_items = ""

    for job in jobs:

        location = (
            job.location
            if job.location
            else "Not specified"
        )

        job_items += f"""
        <li>
            <strong>{job.title}</strong>
            <br>
            Company:
            {job.company.name}
            <br>
            Location:
            {location}
            <br>
            Work mode:
            {job.work_mode}
            <br>
            Employment type:
            {job.employment_type}
        </li>

        <br>
        """

    html_body = f"""
<!DOCTYPE html>
<html>
<body>

    <h2>Jobs you may be interested in</h2>

    <p>
        Hello {candidate_name},
    </p>

    <p>
        We found jobs matching your preferred
        locations.
    </p>

    <ul>
        {job_items}
    </ul>

    <p>
        Log in to Job Board to view these jobs.
    </p>

    <p>
        Job Board
    </p>

</body>
</html>
"""

    # --------------------------------------------------------
    # TEXT JOB LIST
    # --------------------------------------------------------

    text_items = ""

    for job in jobs:

        location = (
            job.location
            if job.location
            else "Not specified"
        )

        text_items += (
            f"\nJob: {job.title}\n"
            f"Company: {job.company.name}\n"
            f"Location: {location}\n"
            f"Work mode: {job.work_mode}\n"
            f"Employment type: "
            f"{job.employment_type}\n"
        )

    text_body = f"""
Jobs you may be interested in

Hello {candidate_name},

We found jobs matching your preferred locations.

{text_items}

Log in to Job Board to view these jobs.

Job Board
"""

    send_email(
        to_email=candidate_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )


# ============================================================
# INTERVIEW SCHEDULED EMAIL
# ============================================================

def send_interview_scheduled_email(
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    scheduled_at: str,
    meeting_link: str | None,
    recruiter_message: str | None = None,
) -> None:

    subject = (
        f"Interview scheduled - {job_title}"
    )

    # --------------------------------------------------------
    # Recruiter message
    # --------------------------------------------------------

    message_section_html = ""

    if recruiter_message:
        message_section_html = f"""
        <h3>Message from recruiter</h3>

        <p>
            {recruiter_message}
        </p>
        """

    message_section_text = ""

    if recruiter_message:
        message_section_text = (
            "\nMessage from recruiter:\n"
            f"{recruiter_message}\n"
        )

    # --------------------------------------------------------
    # Meeting link
    # --------------------------------------------------------

    meeting_link_html = ""

    if meeting_link:
        meeting_link_html = f"""
        <p>
            <strong>Meeting link:</strong>
            <a href="{meeting_link}">
                Join interview
            </a>
        </p>
        """

    else:
        meeting_link_html = """
        <p>
            <strong>Meeting link:</strong>
            The recruiter has not provided a meeting link yet.
        </p>
        """

    meeting_link_text = (
        f"\nMeeting link:\n{meeting_link}\n"
        if meeting_link
        else
        "\nMeeting link:\n"
        "The recruiter has not provided a meeting link yet.\n"
    )

    # --------------------------------------------------------
    # HTML email
    # --------------------------------------------------------

    html_body = f"""
<!DOCTYPE html>
<html>
<body>

    <h2>Interview scheduled</h2>

    <p>
        Hello {candidate_name},
    </p>

    <p>
        The recruiter has scheduled an interview
        for your job application.
    </p>

    <h3>{job_title}</h3>

    <p>
        Company:
        <strong>{company_name}</strong>
    </p>

    <p>
        <strong>Interview date and time:</strong>
        {scheduled_at}
    </p>

    {meeting_link_html}

    {message_section_html}

    <p>
        Please make sure you are available at the
        scheduled time.
    </p>

    <p>
        Job Board
    </p>

</body>
</html>
"""

    # --------------------------------------------------------
    # Plain-text email
    # --------------------------------------------------------

    text_body = f"""
Interview scheduled

Hello {candidate_name},

The recruiter has scheduled an interview
for your job application.

Job: {job_title}

Company: {company_name}

Interview date and time:

{scheduled_at}

{meeting_link_text}

{message_section_text}

Please make sure you are available at the
scheduled time.

Job Board
"""

    send_email(
        to_email=candidate_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )