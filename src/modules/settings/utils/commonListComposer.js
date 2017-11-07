import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { confirm } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';

const commonListComposer = options => {
  const {
    name,
    gqlListQuery,
    gqlTotalCountQuery,
    gqlAddMutation,
    gqlEditMutation,
    gqlRemoveMutation,
    ListComponent
  } = options;

  const ListContainer = props => {
    const {
      listQuery,
      totalCountQuery,
      addMutation,
      editMutation,
      removeMutation
    } = props;

    if (totalCountQuery.loading || listQuery.loading) {
      return <Loading title="Settings" />;
    }

    const totalCount = totalCountQuery[`${name}TotalCount`];

    const objects = listQuery[name];

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            // update queries
            listQuery.refetch();
            totalCountQuery.refetch();

            Alert.success('Congrats', 'Successfully deleted.');
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // create or update action
    const save = ({ doc }, callback, object) => {
      let mutation = addMutation;

      // if edit mode
      if (object) {
        mutation = editMutation;
        doc._id = object._id;
      }

      mutation({
        variables: doc
      })
        .then(() => {
          // update queries
          listQuery.refetch();
          totalCountQuery.refetch();

          Alert.success('Congrats');

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      refetch: listQuery.refetch,
      objects,
      totalCount,
      save,
      remove
    };

    return <ListComponent {...updatedProps} />;
  };

  ListContainer.propTypes = {
    totalCountQuery: PropTypes.object,
    listQuery: PropTypes.object,
    addMutation: PropTypes.func,
    editMutation: PropTypes.func,
    removeMutation: PropTypes.func
  };

  if (gqlAddMutation) {
    return compose(
      gqlListQuery,
      gqlTotalCountQuery,
      // mutations
      gqlAddMutation,
      gqlEditMutation,
      gqlRemoveMutation
    )(ListContainer);
  }

  return compose(gqlListQuery, gqlTotalCountQuery)(ListContainer);
};

export default commonListComposer;
