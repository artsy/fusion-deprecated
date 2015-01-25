aToZ = require 'a_to_z'

describe 'aToZ', ->

  it 'given a collection resource maps it by A-Z', ->
    galleries = [
      { name: 'Bob', _links: { permalink: '' } }
      { name: 'Anne', _links: { permalink: '' } }
      { name: 'Carly', _links: { permalink: '' } }
    ]
    aToZ(galleries)[0].key.should.equal 'A'
    aToZ(galleries)[0].items[0].label.should.equal 'Anne'
    aToZ(galleries)[1].key.should.equal 'B'
    aToZ(galleries)[1].items[0].label.should.equal 'Bob'
    aToZ(galleries)[2].key.should.equal 'C'
    aToZ(galleries)[2].items[0].label.should.equal 'Carly'