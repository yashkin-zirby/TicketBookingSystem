import React, { Component } from 'react';
import { ReactComponent as ProfileIcon } from '../assets/profile-icon.svg';
import { ReactComponent as EditIcon } from '../assets/edit-icon.svg';
import { ReactComponent as UploadIcon } from '../assets/upload-file-icon.svg';
import EventDispatcher from "../services/EventDispatcher.js";
import SessionManager from "../services/SessionManager.js";
import { InfoTicket } from '../ticketComponents/InfoTicket.js';
import "./PagesStyles.css";
import { ModalWindow } from '../modalWindows/ModalWindow';


export class Profile extends Component {
    static displayName = Profile.name;
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            pagesCount: 1,
            tickets: [],
            selected: false,
            username: SessionManager.getUserName(),
            email: SessionManager.getUserEmail(),
            password: "",
            newPassword: "",
            confirmNewPassword: "",
            profileImage: SessionManager.getUserProfileImage(),
            uploadImage: null,
            file: null,
            error_message: "",
            modalClose : true,
        };
        this.selectTickets = this.selectTickets.bind(this);
        this.selectPage = this.selectPage.bind(this);
        this.generatePaging = this.generatePaging.bind(this);
        this.openModal = this.openModal.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changePasswordValue = this.changePasswordValue.bind(this);
        this.changeNewPasswordValue = this.changeNewPasswordValue.bind(this);
        this.changeConfirmNewPasswordValue = this.changeConfirmNewPasswordValue.bind(this);
    }
    selectPage(page) {
        this.setState({ page: page }, () => { this.selectTickets(this.state.filters); });
    }
    selectTickets(filters = null) {
        SessionManager.sendRequest("api/usertickets/ListNotActive", "GET", null, { page: this.state.page }, filters && filters.detail)
            .then((n) => { this.setState({ tickets: n.tickets, page: n.page, pagesCount: n.pagesCount, selected: true, filters }); })
            .catch(e => alert(e));
    }
    componentDidMount() {
        this.selectTickets();
        //EventDispatcher.subscribe("onUserSetSearchFilters", this.selectTickets);
    }
    componentWillUnmount() {
        //EventDispatcher.unsubscribe("onUserSetSearchFilters", this.selectTickets);
    }
    generatePaging(page, count) {
        if (count <= 7) return [...Array(count).keys()].map(n => <div key={"paging" + (n + 1)} className={this.state.page === n + 1 ? "current-page" : ""} onClick={() => this.selectPage(n + 1)}>{n + 1}</div>);
        let result = [];
        result.push(<div key={1} className={page === 1 ? "current-page" : ""} onClick={() => this.selectPage(1)}>1</div>);
        if (page > 4) {
            result.push(<p key="threepoints1">...</p>);
        }
        let val = page < 5 ? 2 : page > count - 4 ? count - 5 : page - 2;
        for (let i = 0; i < 5; i++) {
            result.push(<div key={i+val} className={page === val + i ? "current-page" : ""} onClick={() => this.selectPage(val + i)}>{val + i}</div>);
        }
        if (page < count - 3) {
            result.push(<p key="threepoints2">...</p>);
        }
        result.push(<div key={count} className={page === count ? "current-page" : ""} onClick={() => this.selectPage(count)}>{count}</div>);
        return result;
    }
    uploadFile(e) {
        var file = e.target.files[0];
        this.setState({ uploadImage: URL.createObjectURL(file), file: file });
    }
    uploadImage() {
        if (this.state.file) {
            let form = new FormData();
            form.append("profile", this.state.file);
            SessionManager.sendRequest("/users/uploadProfile", "POST", form).
                then(n => {
                    this.setState({ profileImage: n.profilePath });
                    SessionManager.setUserProfileImage(n.profilePath);
                }).catch(e => console.log(e));
        }
    }
    onCloseModal(e) {
        this.setState({ modalClose: true, uploadImage: null, file: null });
    }
    openModal(e) {
        this.setState({ modalClose: false });
    }
    changePasswordValue(e) {
        this.setState({ password: e.target.value });
    }
    changeNewPasswordValue(e) {
        this.setState({ newPassword: e.target.value });
    }
    changeConfirmNewPasswordValue(e) {
        this.setState({ confirmNewPassword: e.target.value });
    }
    changePassword() {
        if (this.state.newPassword.length === 0) {
            this.setState({ error_message: "введите новый пароль" });
            return;
        }
        if (this.state.newPassword != this.state.confirmNewPassword) {
            this.setState({ error_message: "подтверждение пароля не совпадает с новым паролем" });
            return;
        }
        SessionManager.sendRequest("users/changePassword", "PUT", null, {
            oldPassword: this.state.password,
            newPassword: this.state.newPassword
        })
            .then((n) => {
                if (n.errors) {
                    this.setState({ error_message: n.errors[0] });
                    return;
                }
                this.setState({ error_message: "", password: "", newPassword:"",confirmNewPassword:"" });
                alert("Пароль обновлён");
            })
            .catch(e => alert(e));
        this.setState({ error_message: "" });
        
    }
    render() {
        if (!!this.state.user) {
            return (
                <div className="flex-with-wrap">
                    <h1>Для доступа к этой странице требуется авторизация</h1>
                </div>
            );
        }
        return (
            <div className="page">
                <div className="profile-box">
                    <div className="change-profile-picture-box">
                        <div className="change-profile-picture-container">
                            {this.state.profileImage ?
                                <img src={this.state.profileImage} />
                                : <ProfileIcon />
                            }
                        </div>
                        <EditIcon onClick={this.openModal} />
                    </div>
                    <div className="change-profile-data-box">
                        <div className="change-profile-row">
                            <p>Имя пользователя: </p>
                            <div>
                                {this.state.username}
                            </div>
                        </div>
                        <div className="change-profile-row"><p>Email: </p><div>
                            {this.state.email}</div>
                        </div>
                        <div className="change-profile-row"><p>Пароль: </p>
                            <input type="password" value={this.state.password} onChange={this.changePasswordValue} />
                        </div>
                        <div className="change-profile-row"><p>Новый пароль: </p>
                            <input type="password" value={this.state.newPassword} onChange={this.changeNewPasswordValue} />
                        </div>
                        <div className="change-profile-row"><p>Повторите новый пароль: </p>
                            <input type="password" value={this.state.confirmNewPassword} onChange={this.changeConfirmNewPasswordValue} />
                        </div>
                        <button onClick={this.changePassword}>Изменить пароль</button>
                        <p className="error-message">{this.state.error_message}</p>
                    </div>
                </div>
                <p className="page-title">Ранее вы покупали:</p>
                <div className="flex-with-wrap">
                    {this.state.tickets ? this.state.tickets.map(n => <InfoTicket key={n.id} data={n} />):null}
                </div>
                <div className="paging-container">
                    { this.generatePaging(this.state.page,this.state.pagesCount) }
                </div>
                {this.state.modalClose ? null : <ModalWindow closed={false} dataChanged={this.onCloseModal}>
                    <div className="change-profile-picture-container upload-profile-button visible">
                        <img className="upload-profile-button visible" src={this.state.uploadImage} />
                        <UploadIcon></UploadIcon>
                    </div>
                    <input className="upload-profile-button" type="file" onChange={this.uploadFile} />
                    <div className="confirm-modal-button-container">
                        <button className="confirm-booking-button" onClick={this.uploadImage}>Загрузить фото</button>
                    </div>
                </ModalWindow>}
            </div>
        );
    }
}