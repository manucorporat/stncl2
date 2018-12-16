
export function h() {
  console.log('h');
}

function setValue(memberName, instanceValues, newValue) {
  const oldValue = instanceValues.get(memberName);
  if (oldValue !== newValue) {
    console.log('value changed from', oldValue, 'to', newValue);

    instanceValues.set(memberName, newValue)
    return true;
  }
  return false;
}

function render(instance) {
  console.log('render')
  instance.render();
}

export class IonCheckbox extends HTMLElement {

  async connectedCallback() {
    console.log('connected', this.tagName);
    const elmData = {
      instanceValues: new Map()
    };
    ref.set(this, elmData);

    render(this);
  }

  get checkbox() {
    return ref.get(this).instanceValues.checked;
  }

  set checkbox(newValue) {
    const refItem = ref.get(this);
    if (setValue('checked', refItem.instanceValues, newValue)) {
      render(this);
    }
  }

  render() {
    return h('div', null);
  }

}

const ref = new WeakMap();

const style = 'div { color: blue }';


function proxyMember(Cstr, memberName) {
  console.log('proxyMember', memberName);

  Object.defineProperty(Cstr.prototype, memberName, {
    get() {
      return ref.get(this).instanceValues.get(memberName);
    },
    set(newValue) {
      const refItem = ref.get(this);
      if (setValue(memberName, refItem.instanceValues, newValue)) {
        if (refItem.instance) {
          render(refItem.instance);
        }
      }
    }
  })
}

export function proxyComponent(Cstr, cmpMeta) {
  console.log('proxyComponent', Cstr, cmpMeta);

  cmpMeta[0].forEach(member => {
    proxyMember(Cstr, member[0]);
  });
}

proxyComponent(IonCheckbox, [['checked']])
customElements.define('ion-checkbox', IonCheckbox)