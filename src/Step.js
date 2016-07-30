import Sequence from './Sequence';

export default function Step(name) {
  return (target, methodName, descriptor) => {
    let stepName = name || methodName;
    target.constructor.steps = target.constructor.steps || new Sequence();

    target.constructor.steps.push({
      name: stepName,
      run: target[methodName].bind(target)
    });

    return descriptor;
  };
}
