import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import update from 'immutability-helper';

import FilterComponent from '../../components/FilterComponent/FilterComponent';

import TableComponent from '../../components/TableComponent/TableComponent';

export default class VolunteerListTab extends Component {
    state = {
        volunteers:[],
        filters: {
            filterText: '',
            department: null,
            role: null,
            gotTicket: null,
            isProduction: null
        }
    };

    componentDidMount() {
        this.fetchVolunteers();
    }

    logNetworkError = (err) => {
        if(err.response){
            console.log('Data', err.response.data);
            console.log('Status', err.response.status);
            console.log('Headers', err.response.headers);
        }
        else console.log('Error',err.message);
    }

    fetchVolunteers = () => {
        axios.get('/api/v1/volunteers/')
        .then((res) => this.setState({volunteers:res.data}))
        .catch(this.logNetworkError);
    }

    handleRowDelete = (department, profile_id) => {
        console.log('VolunteerListTab.handleRowDelete');

        axios.delete(`/api/v1/departments/${department}/volunteers/${profile_id}`)
        .then(this.fetchVolunteers)
        .catch( this.logNetworkError);
    }

    handleRowChange = (department, profile_id, diff) => {
        let query = Object.keys(diff).reduce((acc, cur) => `${acc}&${cur}=${diff[cur]}`, '?');
        axios
            .put(`/api/v1/departments/${department}/volunteers/${profile_id}${query}`)
            .then(this.fetchVolunteers)
            .catch(this.logNetworkError);
    }

    handleFilterTextInput = (filterText) => {
        this.handleFilterInput('filterText', filterText);
    }

    handleFilterInput = (filterName, value) => {
         const mergeValue = {
             filters: {
                $merge:{
                    [filterName]:value
                }
            }
        };
        this.setState((previousState) => update(previousState, mergeValue));
    }

    handleAddVolunteers = (department, role, is_production, emails) => {
        console.log(`VolunteerListTab.handleAddVolunteeers: department:${department}, role:${role}, emails:${emails}`);
        // TODO - convert department to department id
        let departmentId = department;
        // TODO - create a request to test emails validity
        if (emails.length < 1) {
            console.log('no volunteers to add');
            return;
        }

        // add volunteers
        console.log(`posting to api/v1/departments/${departmentId}/volunteers`);
        axios
            .post(`/api/v1/departments/${departmentId}/volunteers`, { role, is_production, emails })
            .then(() => console.log('request to server succeeded'))
            .catch(() => console.log('error communicating with server'));
    }

    createVolunteer(volunteers) {
        console.error('not implemented');
    }

//TODO get roles stucture from server side
    render() {
        const { filters, volunteers } = this.state;
        return (
            <div className="volunteer-list-tab-component">
                <div className="container card">
                    <FilterComponent
                        filters={filters}
                        onFilterTextInput={this.handleFilterTextInput}
                        onFilterInput={this.handleFilterInput}
                        onVolunteerSubmit={this.handleAddVolunteers}
                        roles = { ['All','Manager','Day Manager','Shift Manager','Production','Department Manager','Volunteer','Team Leader']}
                    />
                </div>
                <div className="container card container">
                    <TableComponent
                        volunteers={volunteers}
                        filters={filters}
                        onRowDelete={this.handleRowDelete}
                        onRowChange={this.handleRowChange}
                    />
                </div>
            </div>
        );
    }
}
