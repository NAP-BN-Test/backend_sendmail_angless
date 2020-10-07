module.exports = function (app) {
    var company = require('./controllers/company');
    var login = require('./controllers/login');

    var activity = require('./controllers/activity');
    var activityContact = require('./controllers/activity-contact');

    var contact = require('./controllers/contact');
    var deal = require('./controllers/deal');
    var comment = require('./controllers/comment');
    var user = require('./controllers/user');

    var city = require('./controllers/city');

    var call = require('./controllers/call');
    var note = require('./controllers/note');
    var meet = require('./controllers/meet');
    var email = require('./controllers/email');
    var task = require('./controllers/task');

    var summary = require('./controllers/summary');

    var emailList = require('./controllers/emai-list');
    var report = require('./controllers/report');

    var upload = require('./controllers/upload');
    var imports = require('./controllers/import');

    var amazon = require('./controllers/amazon');
    var unsubscribe = require('./controllers/unsubscribe');

    var category = require('./controllers/category')


    // todoList Routes
    app.route('/crm/user_login').post(login.login);

    app.route('/crm/add_user').post(user.addUser);
    app.route('/crm/get_category_list_user').post(user.getListUserCategory);
    app.route('/crm/delete_user').post(user.deleteUser);

    //Company
    app.route('/crm/get_list_company').post(company.getListCompany);
    app.route('/crm/get_list_name_company').post(company.getListNameCompany);

    app.route('/crm/get_detail_company').post(company.getDetailCompany);

    app.route('/crm/get_list_quick_company').post(company.getListQuickCompany);

    app.route('/crm/update_company').post(company.updateCompany);

    app.route('/crm/search_company').post(company.searchCompany);

    app.route('/crm/add_company').post(company.addCompany);

    app.route('/crm/add_parent_company_by_id').post(company.addParentCompanyByID);

    app.route('/crm/add_child_company_by_id').post(company.addChildCompanyByID);

    app.route('/crm/assign_company_owner').post(company.assignCompany);

    app.route('/crm/follow_company').post(company.followCompany);

    app.route('/crm/delete_company').post(company.deleteCompany);

    app.route('/crm/delete_contact_from_company').post(company.deleteContactFromCompany);

    app.route('/crm/delete_company_from_company').post(company.deleteCompanyFromCompany);

    app.route('/crm/delete_deal_from_company').post(company.deleteDealFromCompany);

    app.route('/trailer/create_company').post(company.createCompanyTrailer);


    app.route('/crm/get_list_quick_deal').post(deal.getListQuickDeal);

    app.route('/crm/get_list_quick_deal_for_contact').post(deal.getListQuickDealForContact);

    app.route('/crm/get_deal_stage').post(deal.getDealStage);

    app.route('/crm/add_deal').post(deal.addDeal);

    app.route('/crm/update_deal').post(deal.updateDeal);


    app.route('/crm/get_list_activity').post(activity.getListActivity);

    app.route('/crm/update_activity').post(activity.updateActivity);

    app.route('/crm/get_list_activity_for_contact').post(activityContact.getListActivity);

    app.route('/crm/get_list_user').post(user.getListUser);

    //Meet
    app.route('/crm/create_meet').post(meet.createMeet);

    app.route('/crm/get_list_meet_attend').post(meet.getListMeetAttend);

    app.route('/crm/update_meet_attend').post(meet.updateMeetAttend);

    app.route('/crm/get_meet_associate').post(meet.getAssociate);

    app.route('/crm/update_meet_associate').post(meet.updateAssociate);

    app.route('/crm/get_list_meet').post(meet.getListMeet);

    app.route('/crm/delete_meet').post(meet.deleteMeet);


    //Note
    app.route('/crm/create_note').post(note.createNote);

    app.route('/crm/get_note_associate').post(note.getAssociate);

    app.route('/crm/update_note_associate').post(note.updateAssociate);

    app.route('/crm/delete_note').post(note.deleteNote);

    app.route('/crm/get_list_note').post(note.getListNote);


    //Call
    app.route('/crm/create_call').post(call.createCall);

    app.route('/crm/get_call_associate').post(call.getAssociate);

    app.route('/crm/update_call_associate').post(call.updateAssociate);

    app.route('/crm/get_list_call').post(call.getListCall);

    app.route('/crm/delete_call').post(call.deleteCall);


    //Email
    app.route('/crm/create_email').post(email.createEmail);

    app.route('/crm/get_email_associate').post(email.getAssociate);

    app.route('/crm/update_email_associate').post(email.updateAssociate);

    app.route('/crm/get_list_email').post(email.getListEmail);

    app.route('/crm/delete_email').post(email.deleteEmail);


    app.route('/crm/add_comment').post(comment.addComment);

    app.route('/crm/edit_comment').post(comment.editComment);

    app.route('/crm/delete_comment').post(comment.deleteComment);

    //Task
    app.route('/crm/create_task').post(task.createTask);

    app.route('/crm/get_task_associate').post(task.getAssociate);

    app.route('/crm/update_task_associate').post(task.updateAssociate);

    app.route('/crm/get_list_task').post(task.getListTask);

    app.route('/crm/update_task').post(task.updateTask);

    app.route('/crm/delete_task').post(task.deleteTask);

    //contact
    app.route('/crm/add_contact').post(contact.addContact);

    app.route('/crm/delete_contact').post(contact.deleteContact);

    app.route('/crm/add_contact_by_id').post(contact.addContactByID);

    app.route('/crm/search_contact').post(contact.searchContact);

    app.route('/crm/get_list_quick_contact').post(contact.getListQuickContact);

    app.route('/crm/get_detail_contact').post(contact.getDetailContact);

    app.route('/crm/get_list_contact').post(contact.getListContact);

    app.route('/crm/get_list_contact_full').post(contact.getListContactFull);

    app.route('/crm/update_contact').post(contact.updateContact);

    app.route('/crm/assign_contact_owner').post(contact.assignContact);

    app.route('/crm/follow_contact').post(contact.followContact);

    app.route('/crm/get_list_contact_from_addressbook').post(contact.getListContactFromAddressBook);


    //summary
    app.route('/crm/get_summary_info').post(summary.getListActivity);

    //city
    app.route('/crm/get_list_city').post(city.getListCity);


    //Emai List
    app.route('/crm/get_mail_list').post(emailList.getMailList);

    app.route('/crm/get_mail_list_detail').post(emailList.getMailListDetail);

    app.route('/crm/get_list_mail_campain').post(emailList.getListMailCampain);

    app.route('/crm/add_mail_list').post(emailList.addMailList);

    app.route('/crm/add_mail_list_detail').post(emailList.addMailListDetail);

    app.route('/crm/add_mail_campain').post(emailList.addMailCampain);

    app.route('/crm/get_mail_list_option').post(emailList.getMailListOption);

    app.route('/crm/open_mail').get(emailList.addMailResponse);

    app.route('/crm/delete_mail_list').post(emailList.deleteMailList);

    app.route('/crm/delete_mail_list_detail').post(emailList.deleteMailListDetail);

    app.route('/crm/delete_mail_campain').post(emailList.deleteMailCampain);

    app.route('/crm/get_mail_campain_detail').post(emailList.getMailCampainDetail);

    app.route('/crm/update_mail_campain').post(emailList.updateMailCampain);

    app.route('/crm/add_mail_send').post(emailList.addMailSend);

    app.route('/crm/add_mail_click_link').post(emailList.addMailClickLink);

    app.route('/crm/report_mail_detail').post(emailList.reportEmailDetail);


    //Report
    app.route('/crm/get_list_report_by_campain').post(report.getListReportByCampain);

    app.route('/crm/get_list_report_by_maillist').post(report.getListReportByMaillist);

    app.route('/crm/get_report_by_campain_summary').post(report.getReportByCampainSummary);

    app.route('/crm/get_report_by_maillist_summary').post(report.getReportByMailListSummary);

    app.route('/crm/get_report_by_campain_mail_type').post(report.getReportByCampainMailType);

    app.route('/crm/get_report_by_maillist_type').post(report.getReportByMailListType);

    app.route('/crm/get_report_by_user_summary').post(report.getReportByUserSummary);

    app.route('/crm/get_report_by_user_mail_type').post(report.getReportByUserMailType);


    // Upload file
    app.route('/crm/upload_file').post(upload.uploadFile);

    app.route('/import/import_tx').post(imports.importDataTX);


    // Unsubscribe
    app.route('/unsubscribe/email_unsubscribe').post(unsubscribe.unSubscribe);


    //Aws http
    app.route('/aws/mail_response').post(amazon.amazonResponse);

    app.route('/aws/verify_email').post(amazon.verifyEmail);

    app.route('/aws/check_verify_email').post(amazon.checkVerifyEmail);


    //Category
    app.route('/crm/get_category_city').post(category.getListCity);
    app.route('/crm/add_category_city').post(category.addCity);
    app.route('/crm/update_category_city').post(category.updateCity);
    app.route('/crm/delete_category_city').post(category.deleteCity);

    app.route('/crm/get_all_category_country').post(category.getListAllCountry);
    app.route('/crm/get_category_country').post(category.getListCountry);
    app.route('/crm/add_category_country').post(category.addCountry);
    app.route('/crm/update_category_country').post(category.updateCountry);
    app.route('/crm/delete_category_country').post(category.deleteCountry);

    app.route('/crm/get_category_step').post(category.getListStep);
    app.route('/crm/add_category_step').post(category.addStep);
    app.route('/crm/update_category_step').post(category.updateStep);
    app.route('/crm/delete_category_step').post(category.deleteStep);

    app.route('/crm/get_category_job_tile').post(category.getListJobTile);
    app.route('/crm/add_category_job_tile').post(category.addJobTile);
    app.route('/crm/update_category_job_tile').post(category.updateJobTile);
    app.route('/crm/delete_category_job_tile').post(category.deleteJobTile);

    app.route('/crm/get_category_mail_outcome').post(category.getListMailOutcome);
    app.route('/crm/add_category_mail_outcome').post(category.addMailOutcome);
    app.route('/crm/update_category_mail_outcome').post(category.updateMailOutcome);
    app.route('/crm/delete_category_mail_outcome').post(category.deleteMailOutcome);

    app.route('/crm/get_category_call_outcome').post(category.getListCallOutcome);
    app.route('/crm/add_category_call_outcome').post(category.addCallOutcome);
    app.route('/crm/update_category_call_outcome').post(category.updateCallOutcome);
    app.route('/crm/delete_category_call_outcome').post(category.deleteCallOutcome);

    //history
    var history = require('./controllers/history')

    app.route('/crm/get_history').post(history.getListHistory);
    app.route('/crm/add_history').post(history.addHistory);
    app.route('/crm/delete_history').post(history.deleteHistory);

    // template

    var mailmerge = require('./controllers/mailmerge-campaign');
    app.route('/crm/add_mailmerge_template').post(mailmerge.addMailmergeTemplate);
    app.route('/crm/get_detail_mailmerge_template').post(mailmerge.getDetailMailmergeTemplate);
    app.route('/crm/delete_mailmerge_template').post(mailmerge.deleteMailmergeTemplate);
    app.route('/crm/update_mailmerge_template').post(mailmerge.updateMailmergeTemplate);
    app.route('/crm/get_list_mailmerge_template').post(mailmerge.getListMailmergeTemplate);
    app.route('/crm/get_all_mailmerge_template').post(mailmerge.getAllMailmergeTemplate);

    // additional-infomation
    var infomation = require('./controllers/additional-infomation');
    app.route('/crm/add_additional_information').post(infomation.addAdditionalInformation);
    app.route('/crm/get_detail_additional_information').post(infomation.getDetailAdditionalInformation);
    app.route('/crm/delete_additional_information').post(infomation.deleteAdditionalInformation);
    app.route('/crm/update_additional_information').post(infomation.updateAdditionalInformation);
    app.route('/crm/get_list_additional_information').post(infomation.getListAdditionalInformation);
    app.route('/crm/get_all_additional_information').post(infomation.getAllAdditionalInformation);
    app.route('/crm/delete_image').post(infomation.deleteImage);

    // handle create additional-information
    app.route('/crm/get_all_data_maillist').post(mailmerge.getDatafromInformation);

    var handle_body = require('./controllers/send_maillist');
    // body: body - text-html, ListDataId - list
    app.route('/crm/send_mailmerge').post(handle_body.sendMailList);

    // get list mail from companyID
    app.route('/crm/get_list_contact_from_company').post(contact.getListContactFromCompanyID);
    app.route('/crm/get_list_history_contact').post(contact.getListHistoryContact);

    // create infomation - return ID information
    app.route('/crm/add_information_from_contact').post(infomation.createImformationfromContact);

    //  adress book
    var adddressBook = require('./controllers/address-book');
    app.route('/crm/get_list_address_book').post(adddressBook.getListAddressBook);
    app.route('/crm/search_address_book').post(company.searchCompanyToAddressbook);

    // category customer
    var catagoryCustomer = require('./controllers/category-customer');
    app.route('/crm/add_customer_group').post(catagoryCustomer.addCategory);
    app.route('/crm/update_customer_group').post(catagoryCustomer.updateCategory);
    app.route('/crm/delete_list_customer_group').post(catagoryCustomer.deleteCategory);
    app.route('/crm/get_list_all_customer_group').post(catagoryCustomer.getListAll);
    // mail campaign
    var mail = require('./controllers/send-mail-campaign');

    app.route('/crm/get_list_mail_campaign').post(mail.getListMailCampaign);
    app.route('/crm/get_list_mailmerge').post(mail.getListMailMerge);

};